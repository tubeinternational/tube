import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-shorts-player',
  standalone: true,
  templateUrl: './shorts-player.component.html',
  styleUrls: ['./shorts-player.component.scss'],
})
export class ShortsPlayerComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() src!: string;
  @Input() poster?: string;
  @Input() active = false;

  // ✅ ADD THIS
  @Input() muted = true;

  @ViewChild('videoEl', { static: true })
  videoEl!: ElementRef<HTMLVideoElement>;

  isPaused = true;
  showOverlay = false;
  private overlayTimeout: any = null;

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

  ngOnDestroy(): void {
    if (this.overlayTimeout) {
      clearTimeout(this.overlayTimeout);
    }
  }

  togglePlay() {
    const video = this.videoEl.nativeElement;
    if (video.paused) {
      video.play().catch(() => {});
      this.isPaused = false;
      this.showTransientOverlay();
    } else {
      video.pause();
      this.isPaused = true;
      this.showOverlay = true;
    }
  }

  onPlay() {
    this.isPaused = false;
    this.showTransientOverlay();
  }

  onPause() {
    this.isPaused = true;
    this.showOverlay = true;
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

  private showTransientOverlay() {
    this.showOverlay = true;
    if (this.overlayTimeout) clearTimeout(this.overlayTimeout);
    this.overlayTimeout = setTimeout(() => {
      this.showOverlay = false;
      this.overlayTimeout = null;
    }, 700);
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
