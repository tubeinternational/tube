import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Video, VideoCategory } from '../../../videos/models/video.model';
import { AdminVideoService } from '../../services/admin-video.service';


@Component({
  selector: 'app-edit-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-video.component.html',
  styleUrls: ['./edit-video.component.scss'],
})
export class EditVideoComponent implements OnInit {
  @Input() video!: Video;

  form!: FormGroup;
  loading = false;
  categories: VideoCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminVideoService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [''],
      description: [''],
      category: [''],

      // SEO
      metaTitle: [''],
      metaDescription: [''],
      focusKeywords: [''],

      thumbnail: [null],
    });

    this.loadCategories();

    if (this.video) {
      this.form.patchValue({
        title: this.video.title,
        description: this.video.description,
        category: this.video.category,

        metaTitle: this.video.meta_title,
        metaDescription: this.video.meta_description,
        focusKeywords: this.video.focus_keywords?.join(', '),
      });
    }
  }

  // =========================
  // CATEGORIES
  // =========================
  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: () => console.warn('Failed to load categories'),
    });
  }

  // =========================
  // THUMBNAIL
  // =========================
  onThumbnailChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ thumbnail: file });
    }
  }

  // =========================
  // SUBMIT
  // =========================
  submit(): void {
    if (!this.video?.id) return;

    this.loading = true;

    const {
      title,
      description,
      category,
      metaTitle,
      metaDescription,
      focusKeywords,
      thumbnail,
    } = this.form.value;

    // =====================
    // WITH THUMBNAIL
    // =====================
    if (thumbnail instanceof File) {
      const formData = new FormData();

      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (category) formData.append('category', category);

      if (metaTitle) formData.append('meta_title', metaTitle);
      if (metaDescription) formData.append('meta_description', metaDescription);
      if (focusKeywords) formData.append('focus_keywords', focusKeywords);

      formData.append('thumbnail', thumbnail);

      this.adminService.updateVideoWithFile(this.video.id, formData).subscribe({
        next: () => {
          this.loading = false;
          this.activeModal.close(true);
        },
        error: () => (this.loading = false),
      });
    }
    // =====================
    // WITHOUT THUMBNAIL
    // =====================
    else {
      const payload = {
        title: title || undefined,
        description: description || undefined,
        category: category || undefined,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        focus_keywords: focusKeywords || undefined,
      };

      this.adminService.updateVideo(this.video.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.activeModal.close(true);
        },
        error: () => (this.loading = false),
      });
    }
  }
}
