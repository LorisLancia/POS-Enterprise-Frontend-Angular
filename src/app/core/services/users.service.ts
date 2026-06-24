// src/app/core/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: {
    username: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive?: boolean;
    storeId?: number;
  }): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(
    id: number,
    user: Partial<{
      password?: string;
      fullName?: string;
      role?: UserRole;
      isActive?: boolean;
      storeId?: number;
    }>,
  ): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
