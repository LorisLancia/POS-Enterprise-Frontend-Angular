import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unit } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private apiUrl = 'http://localhost:3000/units';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.apiUrl);
  }

  create(unit: Omit<Unit, 'id' | 'storeId' | 'createdAt' | 'isActive'>): Observable<Unit> {
    return this.http.post<Unit>(this.apiUrl, unit);
  }

  update(id: number, unit: Partial<Unit>): Observable<Unit> {
    return this.http.patch<Unit>(`${this.apiUrl}/${id}`, unit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
