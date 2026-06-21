import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    role: string;
    permissions: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000';
  private token = localStorage.getItem('token') || '';
  private userSubject = new BehaviorSubject<any>(null);
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

  logout() {
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

  private loadUser() {
    this.http.get(`${this.apiUrl}/auth/me`).subscribe({
      next: (user: any) => this.userSubject.next(user),
      error: () => this.logout(),
    });
  }
}
