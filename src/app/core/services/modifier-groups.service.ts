import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModifierGroup } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ModifierGroupsService {
  private apiUrl = 'http://localhost:3000/modifier-groups';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ModifierGroup[]> {
    return this.http.get<ModifierGroup[]>(this.apiUrl);
  }

  getById(id: number): Observable<ModifierGroup> {
    return this.http.get<ModifierGroup>(`${this.apiUrl}/${id}`);
  }

  create(group: any): Observable<ModifierGroup> {
    return this.http.post<ModifierGroup>(this.apiUrl, group);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
