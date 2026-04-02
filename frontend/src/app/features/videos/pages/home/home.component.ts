import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';
import { buildPaginationPages } from '../../../../shared/utils/pagination.utils';
import { DEFAULT_SEO } from '../../../../core/seo/default.seo';

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

  query = '';
  category = '';
  country = '';
  sort: 'latest' | 'trending' | 'views' = 'latest';

  currentPage = 1;
  limit = 25;
  totalPages = 1;
  total = 0;

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(DEFAULT_SEO.title);

    this.meta.updateTag({
      name: 'description',
      content: DEFAULT_SEO.description,
    });

    this.meta.updateTag({
      name: 'keywords',
      content: DEFAULT_SEO.keywords,
    });

    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.category = params['category'] || '';
      this.country = params['country'] || '';
      this.sort = params['sort'] || 'latest';
      this.currentPage = 1;
      this.fetchVideos(1);
    });
  }

  fetchVideos(page = this.currentPage): void {
    if (page < 1 || page > this.totalPages) return;

    this.loading = true;

    this.videoService
      .getVideos({
        page,
        limit: this.limit,
        q: this.query || undefined,
        category: this.category || undefined,
        country: this.country || undefined,
        sort: this.sort !== 'latest' ? this.sort : undefined,
      })
      .subscribe({
        next: (res) => {
          this.videos = Array.isArray(res.results) ? res.results : [];
          this.currentPage = res.page || 1;
          this.totalPages = res.totalPages || 1;
          this.total = res.total || 0;

          console.log({
            page: res.page,
            totalPages: res.totalPages,
            total: res.total,
          });

          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load videos', err);
          this.loading = false;
        },
      });
  }

  onPageChange(page: number): void {
    if (page === this.currentPage || page < 1 || page > this.totalPages) {
      return;
    }

    this.fetchVideos(page);
  }

  get pages(): number[] {
    if (!this.totalPages) return [1];
    return buildPaginationPages(this.currentPage, this.totalPages, 2);
  }
}
