import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';
import { buildPaginationPages } from '../../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  videos: Video[] = [];
  loading = false;

  // 🔎 filters
  query = '';
  category = '';
  country = ''; // ✅ ADD THIS

  // 📄 pagination
  currentPage = 1;
  limit = 25;
  totalPages = 0;
  total = 0;

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.category = params['category'] || '';
      this.country = params['country'] || ''; // ✅ ADD THIS

      // reset when filters change
      this.currentPage = 1;
      this.fetchVideos(1);
    });
  }

  fetchVideos(page = this.currentPage): void {
    this.loading = true;

    this.videoService
      .getVideos({
        page,
        limit: this.limit,
        q: this.query || undefined,
        category: this.category || undefined,
        country: this.country || undefined, // ✅ ADD THIS
      })
      .subscribe({
        next: (res) => {
          this.videos = res.results;
          this.currentPage = res.page;
          this.totalPages = res.totalPages;
          this.total = res.total;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load videos', err);
          this.loading = false;
        },
      });
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;
    this.fetchVideos(page);
  }

  get pages(): number[] {
    return buildPaginationPages(this.currentPage, this.totalPages, 2);
  }
}
