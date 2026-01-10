import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-shorts-player',
  standalone: true,
  templateUrl: './shorts-player.component.html',
  styleUrls: ['./shorts-player.component.scss'],
})
export class ShortsPlayerComponent implements OnChanges, AfterViewInit {
  @Input() src!: string;
  @Input() poster?: string;
  @Input() active = false;

  // ✅ ADD THIS
  @Input() muted = true;

  @ViewChild('videoEl', { static: true })
  videoEl!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this.syncMute();
    if (this.active) {
      this.tryPlay();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['muted']) {
      this.syncMute();
    }

    if (changes['active']) {
      this.active ? this.tryPlay() : this.pause();
    }
  }

  togglePlay() {
    const video = this.videoEl.nativeElement;
    video.paused ? video.play() : video.pause();
  }

  private tryPlay() {
    const video = this.videoEl.nativeElement;
    video.muted = this.muted; // 🔑 IMPORTANT
    video.playsInline = true;

    if (video.readyState >= 2) {
      video.play().catch(() => {});
    } else {
      video.onloadedmetadata = () => {
        video.play().catch(() => {});
      };
    }
  }

  private pause() {
    this.videoEl.nativeElement.pause();
  }

  private syncMute() {
    if (this.videoEl) {
      this.videoEl.nativeElement.muted = this.muted;
    }
  }
}
