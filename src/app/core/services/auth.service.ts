// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse, AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000';
  private token = localStorage.getItem('token') || '';
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.token) this.loadUser();
  }

  login(username: string, pin: string, storeId: number): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, pin, storeId })
      .pipe(
        tap((res) => {
          this.token = res.access_token;
          localStorage.setItem('token', res.access_token);
          this.userSubject.next(res.user);
        }),
      );
  }

  logout(): void {
    this.token = '';
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  getToken(): string {
    return this.token;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  hasPermission(perm: string): boolean {
    const user = this.userSubject.value;
    if (!user) return false;
    return user.permissions?.includes('*') || user.permissions?.includes(perm);
  }

  private loadUser(): void {
    this.http.get<AuthUser>(`${this.apiUrl}/auth/me`).subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.logout(),
    });
  }
}
