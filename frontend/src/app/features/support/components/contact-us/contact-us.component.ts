import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent {
  form!: FormGroup;
  loading = false;
  success = false;

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.success = false;

    this.supportService.contactUs(this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
