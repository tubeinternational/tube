import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Video, VideoCategory } from '../../../videos/models/video.model';
import { AdminVideoService } from '../../services/admin-video.service';
import { AddVideoComponent } from '../../components/add-video/add-video.component';
import { EditVideoComponent } from '../../components/edit-video/edit-video.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { buildPaginationPages } from '../../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-admin-videos',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterLink, FormsModule],
  templateUrl: './admin-videos.component.html',
  styleUrls: ['./admin-videos.component.scss'],
})
export class AdminVideosComponent implements OnInit {
  videos: Video[] = [];
  categories: VideoCategory[] = [];

  loading = false;

  currentPage = 1;
  limit = 25;
  totalPages = 1;
  total = 0;

  searchQuery = '';
  selectedCategory = '';

  constructor(
    private adminService: AdminVideoService,
    private modal: NgbModal,
  ) {}

  ngOnInit(): void {
    this.fetchVideos(1);
    this.loadCategories();
  }

  fetchVideos(page = this.currentPage): void {
    if (page < 1 || page > this.totalPages) return;

    this.loading = true;

    this.adminService
      .getVideos(
        page,
        this.limit,
        this.searchQuery?.trim() || undefined,
        this.selectedCategory ?? undefined,
      )
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
        error: () => (this.loading = false),
      });
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
    });
  }

  onSearch(): void {
    this.fetchVideos(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.fetchVideos(1);
  }

  getViewRoute(video: Video): any[] {
    return video.video_type === 'short'
      ? ['/shorts', video.slug]
      : ['/video', video.slug];
  }

  get pages(): number[] {
    if (!this.totalPages) return [1];
    return buildPaginationPages(this.currentPage, this.totalPages, 2);
  }

  onPageChange(page: number): void {
    if (page === this.currentPage || page < 1 || page > this.totalPages) {
      return;
    }

    this.fetchVideos(page);
  }

  openAddModal(): void {
    const ref = this.modal.open(AddVideoComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    ref.closed.subscribe((result) => {
      if (result) this.fetchVideos(this.currentPage);
    });
  }

  openEditModal(video: Video): void {
    const ref = this.modal.open(EditVideoComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    ref.componentInstance.video = video;

    ref.closed.subscribe((result) => {
      if (result) this.fetchVideos(this.currentPage);
    });
  }

  deleteVideo(video: Video): void {
    const ref = this.modal.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static',
      centered: true,
    });

    ref.componentInstance.title = 'Delete Video';
    ref.componentInstance.message =
      'Are you sure you want to delete this video? This action cannot be undone.';
    ref.componentInstance.confirmText = 'Delete';
    ref.componentInstance.cancelText = 'Cancel';
    ref.componentInstance.danger = true;

    ref.closed.subscribe((confirmed) => {
      if (!confirmed) return;

      this.adminService.deleteVideo(video.id).subscribe(() => {
        this.fetchVideos(this.currentPage);
      });
    });
  }

  toggleVideo(video: Video): void {
    this.adminService.toggleVideo(video.id).subscribe(() => {
      this.fetchVideos(this.currentPage);
    });
  }
}
