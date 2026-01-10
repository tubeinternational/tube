import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-shorts-actions',
  standalone: true,
  templateUrl: './shorts-actions.component.html',
  styleUrls: ['./shorts-actions.component.scss'],
})
export class ShortsActionsComponent {
  @Input() likes = 0;
  @Input() liked = false;
  @Input() muted = true;

  @Output() like = new EventEmitter<void>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();

  onLike() {
    this.like.emit();
  }

  onToggleMute() {
    this.toggleMute.emit();
  }

  onShare() {
    this.share.emit();
  }
}
