import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddonGroup, CreateAddonGroupDto, UpdateAddonGroupDto } from '../models/addon-group.model';

@Injectable({ providedIn: 'root' })
export class AddonGroupsService {
  private api = `http://localhost:3000/addon-groups`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AddonGroup[]> {
    return this.http.get<AddonGroup[]>(this.api);
  }

  getById(id: number): Observable<AddonGroup> {
    return this.http.get<AddonGroup>(`${this.api}/${id}`);
  }

  create(dto: CreateAddonGroupDto): Observable<AddonGroup> {
    return this.http.post<AddonGroup>(this.api, dto);
  }

  update(id: number, dto: UpdateAddonGroupDto): Observable<AddonGroup> {
    return this.http.patch<AddonGroup>(`${this.api}/${id}`, dto);
  }

  delete(id: number): Observable<AddonGroup> {
    return this.http.delete<AddonGroup>(`${this.api}/${id}`);
  }
}
