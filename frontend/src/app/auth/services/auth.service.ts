// auth/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  LoginRequest,
  OtpVerifyRequest,
  LoginResponse,
  VerifyOtpResponse,
  MeResponse,
} from '../auth.model';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.baseUrl}/auth`;
  private router = inject(Router)

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  signin(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.API}/log-in`, data).pipe(
      tap((res) => {
        // save token
        localStorage.setItem('accessToken', res.accessToken);
        // save user in memory
        this.userSubject.next(res.user);
      })
    );
  }

  verifyOtp(data: OtpVerifyRequest) {
    return this.http.post<VerifyOtpResponse>(`${this.API}/verify-otp`, data, {
      withCredentials: true,
    });
  }

  setUser(user: any) {
    this.userSubject.next(user);
  }

  me() {
    return this.http
      .get<any>(`${this.API}/me`, { withCredentials: true })
      .pipe(tap((res) => this.setUser(res.user)));
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/sign-in']);
  }

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  clearToken() {
    localStorage.removeItem('accessToken');
  }
}
