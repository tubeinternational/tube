import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { VideoService } from '../../services/video.service';
import { ShortsFeedService } from '../../../shorts/services/shorts-feed.service';
import { Video } from '../../models/video.model';
import { VideoCardComponent } from '../../components/video-card/video-card.component';

@Component({
  selector: 'app-video-watch',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, FormsModule],
  templateUrl: './video-watch.component.html',
  styleUrls: ['./video-watch.component.scss'],
})
export class VideoWatchComponent implements OnInit, OnDestroy {
  video?: Video;
  relatedVideos: Video[] = [];
  loading = true;
  copied = false;

  isPlaying = false;
  isReady = false;
  isEnded = false;
  controlsVisible = true;
  muted = false;

  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;

  hideTimer: any;
  private destroy$ = new Subject<void>();

  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private shortService: ShortsFeedService,
    private title: Title,
    private meta: Meta
  ) {}

  /* ---------------- SEO ---------------- */
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

  /* ---------------- PLAYER ---------------- */
  togglePlay(): void {
    const video = this.videoRef.nativeElement;

    if (!video.src) return;

    if (video.paused || this.isEnded) {
      this.isEnded = false;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  toggleMute(): void {
    const video = this.videoRef.nativeElement;
    video.muted = !video.muted;

    if (!video.muted && video.volume === 0) {
      video.volume = 0.5;
    }

    this.muted = video.muted;
  }

  get volumeIcon(): string {
    const video = this.videoRef?.nativeElement;
    if (!video || this.muted || video.volume === 0) return 'fa-volume-xmark';
    if (video.volume < 0.5) return 'fa-volume-low';
    return 'fa-volume-high';
  }

  setVolume(e: Event): void {
    const input = e.target as HTMLInputElement;
    const video = this.videoRef.nativeElement;

    const vol = +input.value;

    video.muted = false;
    video.volume = vol;

    this.muted = vol === 0;
  }

  onLoadedMetadata(e: Event): void {
    const video = e.target as HTMLVideoElement;
    this.duration = video.duration;
    this.isReady = true;
  }

  onTimeUpdate(e: Event): void {
    const video = e.target as HTMLVideoElement;
    this.currentTime = video.currentTime;
    this.progress =
      this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;

    if (this.duration && video.currentTime >= this.duration) {
      this.isEnded = true;
      this.isPlaying = false;
    }
  }

  scrub(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.videoRef.nativeElement.currentTime = +input.value;
  }

  seek(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.videoRef.nativeElement.currentTime = percent * this.duration;
  }

  showControls(): void {
    this.controlsVisible = true;
    clearTimeout(this.hideTimer);
  }

  hideControlsLater(): void {
    if (!this.isPlaying) return;
    this.hideTimer = setTimeout(() => {
      this.controlsVisible = false;
    }, 2000);
  }

  toggleFullscreen(): void {
    const video: any = this.videoRef.nativeElement;

    if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      video.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;

      this.loading = true;

      this.videoService.getVideoBySlug(slug).subscribe({
        next: (video) => {
          this.video = video;
          this.loading = false;
          this.applySeo(video);

          this.isPlaying = false;
          this.isReady = false;
          this.isEnded = false;
          this.currentTime = 0;
          this.progress = 0;

          this.videoService.incrementViews(video.id!).subscribe();
          this.videoService
            .getRelatedVideos(video.id!)
            .subscribe((rv) => (this.relatedVideos = rv));
        },
        error: () => (this.loading = false),
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------------- ACTIONS ---------------- */
  openRelated(video: Video): void {
    if (!video.slug) return;
    this.router.navigate(['/video', video.slug]);
  }

  onLike(): void {
    if (!this.video || this.video.is_liked) return;

    this.shortService.like(this.video.id!).subscribe((res) => {
      this.video!.is_liked = true;
      this.video!.likes_count = res.likes_count;
    });
  }

  onShare(): void {
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
