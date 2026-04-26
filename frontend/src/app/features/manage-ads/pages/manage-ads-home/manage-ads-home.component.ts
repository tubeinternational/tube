import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbCollapseModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { ManageAdsService } from '../../services/manage-ads.service';
import {
  Ad,
  AdPlacement,
  CreateAdPayload,
} from '../../models/manage-ads.model';

@Component({
  selector: 'app-manage-ads-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbNavModule, NgbCollapseModule],
  templateUrl: './manage-ads-home.component.html',
  styleUrls: ['./manage-ads-home.component.scss'],
})
export class ManageAdsHomeComponent implements OnInit {
  activeTab: 'HOME' | 'VIDEO' | 'FOOTER' = 'HOME';

  isFormCollapsed = true;
  isEditMode = false;
  selectedAdId: number | null = null;

  ads: Ad[] = [];
  loading = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adsService: ManageAdsService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAds();
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      placement: ['HOME_TOP', Validators.required],
      code: ['', Validators.required],
      device: ['ALL'],
      priority: [0],
      is_active: [true],
    });
  }

  // =========================
  // TAB CHANGE
  // =========================
  selectTab(tab: any) {
    this.activeTab = tab;
    this.loadAds();
  }

  getPlacements(): AdPlacement[] {
    switch (this.activeTab) {
      case 'HOME':
        return ['HOME_TOP', 'HOME_GRID'];
      case 'VIDEO':
        return ['VIDEO_TOP', 'VIDEO_BELOW'];
      case 'FOOTER':
        return ['FOOTER'];
      default:
        return ['HOME_TOP'];
    }
  }

  // =========================
  // LOAD ADS
  // =========================
  loadAds() {
    this.loading = true;

    const placements = this.getPlacements();

    this.adsService.getAds().subscribe({
      next: (res) => {
        // ✅ filter multiple placements here
        this.ads = res.results.filter((ad) =>
          placements.includes(ad.placement),
        );

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // =========================
  // SUBMIT
  // =========================
  submit() {
    if (this.form.invalid) return;

    const payload: CreateAdPayload = this.form.value;

    if (this.isEditMode && this.selectedAdId) {
      this.adsService.updateAd(this.selectedAdId, payload).subscribe(() => {
        this.resetForm();
        this.loadAds();
      });
    } else {
      this.adsService.createAd(payload).subscribe(() => {
        this.resetForm();
        this.loadAds();
      });
    }
  }

  // =========================
  // EDIT
  // =========================
  edit(ad: Ad) {
    this.isEditMode = true;
    this.selectedAdId = ad.id;
    this.isFormCollapsed = false;

    this.form.patchValue(ad);
  }

  // =========================
  // DELETE
  // =========================
  delete(id: number) {
    if (!confirm('Delete this ad?')) return;

    this.adsService.deleteAd(id).subscribe(() => {
      this.loadAds();
    });
  }

  // =========================
  // TOGGLE
  // =========================
  toggle(ad: Ad) {
    this.adsService.toggleAd(ad.id).subscribe(() => {
      this.loadAds();
    });
  }

  // =========================
  // RESET
  // =========================
  resetForm() {
    this.form.reset({
      name: '',
      placement: 'HOME_TOP',
      code: '',
      device: 'ALL',
      priority: 0,
      is_active: true,
    });

    this.isEditMode = false;
    this.selectedAdId = null;
    this.isFormCollapsed = true;
  }
}
