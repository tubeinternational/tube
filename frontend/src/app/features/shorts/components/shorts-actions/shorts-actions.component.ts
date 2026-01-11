import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-shorts-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shorts-actions.component.html',
  styleUrls: ['./shorts-actions.component.scss'],
})
export class ShortsActionsComponent {
  @Input() likes = 0;
  @Input() liked = false;
  @Input() muted = true;
  @Input() slug?: string;

  copied = false;

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
    if (!this.slug) return;

    const url = `${window.location.origin}/shorts/${this.slug}`;

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
