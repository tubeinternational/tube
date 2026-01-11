import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.model';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ShortsFeedService } from '../../../shorts/services/shorts-feed.service';

@Component({
  selector: 'app-video-watch',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, FormsModule],
  templateUrl: './video-watch.component.html',
  styleUrls: ['./video-watch.component.scss'],
})
export class VideoWatchComponent implements OnInit {
  // =====================
  // VIDEO DATA
  // =====================
  video?: Video;
  relatedVideos: Video[] = [];
  loading = true;
  copied = false;

  // =====================
  // PLAYER STATE
  // =====================
  isPlaying = false;
  controlsVisible = true;
  muted = false;

  currentTime = 0;
  duration = 0;
  progress = 0;

  hideTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private shortService: ShortsFeedService,
    private title: Title,
    private meta: Meta
  ) {}

  @ViewChild('videoEl')
  videoRef!: ElementRef<HTMLVideoElement>;

  // =====================
  // SEO
  // =====================
  private applySeo(video: Video): void {
    this.title.setTitle(video.meta_title || video.title);

    this.meta.updateTag({
      name: 'description',
      content: video.meta_description || video.description || '',
    });

    if (video.focus_keywords?.length) {
      this.meta.updateTag({
        name: 'keywords',
        content: video.focus_keywords.join(', '),
      });
    }
  }

  // =====================
  // PLAYER CONTROLS
  // =====================
  togglePlay() {
    const video = this.videoRef.nativeElement;

    // Ensure video has a valid source before attempting to play
    if (!video.src || !this.video?.stream_url) {
      return;
    }

    video.paused ? video.play() : video.pause();
  }

  toggleMute() {
    const video = this.videoRef.nativeElement;
    video.muted = !video.muted;
    this.muted = video.muted;
  }

  setVolume(e: Event) {
    const input = e.target as HTMLInputElement;
    this.videoRef.nativeElement.volume = +input.value;
  }

  onLoadedMetadata(e: Event) {
    const video = e.target as HTMLVideoElement;
    this.duration = video.duration;
  }

  onTimeUpdate(e: Event) {
    const video = e.target as HTMLVideoElement;
    this.currentTime = video.currentTime;
    this.progress = (this.currentTime / this.duration) * 100;
  }

  scrub(e: Event) {
    const input = e.target as HTMLInputElement;
    this.videoRef.nativeElement.currentTime = +input.value;
  }

  seek(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.videoRef.nativeElement.currentTime = percent * this.duration;
  }

  showControls() {
    this.controlsVisible = true;
    clearTimeout(this.hideTimer);
  }

  hideControlsLater() {
    this.hideTimer = setTimeout(() => {
      this.controlsVisible = false;
    }, 2000);
  }

  toggleFullscreen() {
    document.fullscreenElement
      ? document.exitFullscreen()
      : this.videoRef.nativeElement.parentElement?.requestFullscreen();
  }

  // =====================
  // LIFECYCLE
  // =====================
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;

      this.loading = true;

      this.videoService.getVideoBySlug(slug).subscribe({
        next: (video) => {
          this.video = video;
          this.loading = false;

          this.applySeo(video);

          // Increment views (fire & forget)
          this.videoService.incrementViews(video.id!).subscribe();

          // Load related videos (NO pagination)
          this.videoService.getRelatedVideos(video.id!).subscribe((rv) => {
            this.relatedVideos = rv;
          });
        },
        error: () => {
          this.loading = false;
        },
      });
    });
  }

  openRelated(video: Video): void {
    if (!video.slug) return;
    this.router.navigate(['/video', video.slug]);
  }

  onLike() {
    if (!this.video || this.video.is_liked) return;

    this.shortService.like(this.video.id!).subscribe((res) => {
      this.video!.is_liked = true;
      this.video!.likes_count = res.likes_count;
    });
  }

  onShare() {
    if (!this.video?.slug) return;

    const url = `${window.location.origin}/video/${this.video.slug}`;

    const showCopied = () => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1200);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(showCopied);
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showCopied();
    }
  }
}
