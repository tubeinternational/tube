import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminVideoService } from '../../../admin/services/admin-video.service';
import { VideoCategory } from '../../models/video.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  categories: VideoCategory[] = [];
  selected = new Set<string>();
  isAdmin = false;
  loading = false;

  constructor(
    private adminService: AdminVideoService,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe((user) => {
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  toggleSelection(id: string): void {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
  }

  deleteSelected(): void {
    if (!this.selected.size) return;

    if (!confirm('Delete selected categories?')) return;

    this.adminService.deleteCategories([...this.selected]).subscribe(() => {
      this.categories = this.categories.filter((c) => !this.selected.has(c.id));
      this.selected.clear();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;

    this.adminService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
