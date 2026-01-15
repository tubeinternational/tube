import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminVideoService } from '../../services/admin-video.service';
import { VideoCategory } from '../../../videos/models/video.model';

@Component({
  selector: 'app-add-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss'],
})
export class AddVideoComponent implements OnInit {
  form!: FormGroup;
  submitting = false;

  videoFile?: File;
  thumbnailFile?: File;
  categoryImage?: File;

  categories: VideoCategory[] = [];
  showAddCategory = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminVideoService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      country: ['', Validators.required],
      newCategory: [''],

      videoType: ['normal', Validators.required],

      metaTitle: [''],
      metaDescription: [''],
      focusKeywords: [''],

      sourceType: ['cloudflare', Validators.required],
      videoUrl: [''],
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => (this.categories = res),
    });
  }

  onCategoryImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.categoryImage = input.files[0];
    }
  }

  addCategory(): void {
    const name = this.form.value.newCategory?.trim();

    if (!name || !this.categoryImage) {
      alert('Category name and image are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_image', this.categoryImage);

    this.adminService.createCategory(formData).subscribe({
      next: () => {
        this.form.patchValue({ newCategory: '' });
        this.categoryImage = undefined;
        this.showAddCategory = false;
        this.loadCategories();
      },
      error: () => alert('Failed to create category'),
    });
  }

  onVideoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.videoFile = input.files[0];
  }

  onThumbnailSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.thumbnailFile = input.files[0];
  }

  submit(): void {
    if (this.form.invalid || !this.thumbnailFile) return;

    this.submitting = true;

    const formData = new FormData();
    const v = this.form.value;

    formData.append('title', v.title);
    formData.append('description', v.description || '');
    if (v.category) formData.append('category', v.category);
    formData.append('country', v.country);
    formData.append('video_type', v.videoType);
    formData.append('storage_type', v.sourceType);
    formData.append('thumbnail', this.thumbnailFile);

    if (v.metaTitle) formData.append('meta_title', v.metaTitle);
    if (v.metaDescription)
      formData.append('meta_description', v.metaDescription);
    if (v.focusKeywords) formData.append('focus_keywords', v.focusKeywords);

    if (v.sourceType === 'local') {
      if (!this.videoFile) {
        alert('Video file required');
        this.submitting = false;
        return;
      }
      formData.append('video', this.videoFile);
    } else {
      formData.append('video_url', v.videoUrl);
    }

    this.adminService.uploadVideo(formData).subscribe({
      next: () => this.activeModal.close(true),
      error: () => {
        this.submitting = false;
        alert('Upload failed');
      },
    });
  }
}
