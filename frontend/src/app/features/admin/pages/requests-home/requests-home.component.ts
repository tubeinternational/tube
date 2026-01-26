import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService } from '../../../support/services/support.service';

@Component({
  selector: 'app-requests-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests-home.component.html',
  styleUrl: './requests-home.component.scss',
})
export class RequestsHomeComponent implements OnInit {
  private support = inject(SupportService);

  contactRequests: any[] = [];
  contentRequests: any[] = [];

  contactPage = 1;
  contentPage = 1;
  limit = 10;

  contactTotal = 0;
  contentTotal = 0;

  loading = false;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    Promise.all([
      this.support.getContactRequests(this.contactPage, this.limit).toPromise(),
      this.support
        .getContentRemovalRequests(this.contentPage, this.limit)
        .toPromise(),
    ]).then(([c, r]) => {
      this.contactRequests = c.data;
      this.contactTotal = c.pagination.total;

      this.contentRequests = r.data;
      this.contentTotal = r.pagination.total;

      this.loading = false;
    });
  }

  resolve(id: string) {
    this.support.updateRemovalStatus(id, 'resolved').subscribe(() => {
      const item = this.contentRequests.find((x) => x.id === id);
      if (item) item.status = 'resolved';
    });
  }

  nextContacts() {
    this.contactPage++;
    this.load();
  }

  prevContacts() {
    if (this.contactPage > 1) {
      this.contactPage--;
      this.load();
    }
  }

  nextContent() {
    this.contentPage++;
    this.load();
  }

  prevContent() {
    if (this.contentPage > 1) {
      this.contentPage--;
      this.load();
    }
  }
}
