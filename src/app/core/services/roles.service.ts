import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, PermissionGroup, CreateRoleDto, UpdateRoleDto } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  getPermissions(): Observable<PermissionGroup[]> {
    return this.http.get<PermissionGroup[]>(`${this.apiUrl}/roles/permissions`);
  }

  createRole(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, dto);
  }

  updateRole(id: number, dto: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/roles/${id}`, dto);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
}
