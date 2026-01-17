import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ContactUsPayload,
  ContentRemovalPayload,
} from '../suport.model';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly baseUrl = '/api/support';

  constructor(private http: HttpClient) {}

  contactUs(payload: ContactUsPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact`, payload);
  }

  contentRemoval(payload: ContentRemovalPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/content-removal`, payload);
  }
}
