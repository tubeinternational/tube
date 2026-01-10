import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Video } from '../../models/video.model';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss'],
})
export class VideoCardComponent {
  @Input() video!: Video;

  constructor(private router: Router) {}

  openVideo(): void {
    if (!this.video.slug) return;
    this.router.navigate(['/video', this.video.slug]);
  }
}
