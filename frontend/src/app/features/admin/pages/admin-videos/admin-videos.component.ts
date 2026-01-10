import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Video } from '../../../videos/models/video.model';
import { AdminVideoService } from '../../services/admin-video.service';
import { AddVideoComponent } from '../../components/add-video/add-video.component';
import { EditVideoComponent } from '../../components/edit-video/edit-video.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { RouterLink } from '@angular/router';
import { buildPaginationPages } from '../../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-admin-videos',
  standalone: true,
  imports: [CommonModule, NgbModule, RouterLink],
  templateUrl: './admin-videos.component.html',
  styleUrls: ['./admin-videos.component.scss'],
})
export class AdminVideosComponent implements OnInit {
  videos: Video[] = [];
  loading = false;

  currentPage = 1;
  limit = 25;
  totalPages = 0;
  total = 0;

  constructor(
    private adminService: AdminVideoService,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.fetchVideos(1);
  }

  fetchVideos(page = 1): void {
    this.loading = true;

    this.adminService.getVideos(page, this.limit).subscribe({
      next: (res) => {
        this.videos = res.results;
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.total = res.total;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openAddModal(): void {
    const ref = this.modal.open(AddVideoComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    ref.closed.subscribe((result) => {
      if (result) this.fetchVideos();
    });
  }

  openEditModal(video: Video): void {
    const ref = this.modal.open(EditVideoComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    ref.componentInstance.video = video;

    ref.closed.subscribe((result) => {
      if (result) this.fetchVideos();
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
        this.fetchVideos();
      });
    });
  }

  toggleVideo(video: Video): void {
    this.adminService.toggleVideo(video.id).subscribe(() => {
      this.fetchVideos();
    });
  }

  get pages(): number[] {
    return buildPaginationPages(this.currentPage, this.totalPages, 2);
  }
}
