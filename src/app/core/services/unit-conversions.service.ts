import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitConversion } from '../models/unit-conversion.model';

@Injectable({ providedIn: 'root' })
export class UnitConversionsService {
  private apiUrl = 'http://localhost:3000/unit-conversions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UnitConversion[]> {
    return this.http.get<UnitConversion[]>(this.apiUrl);
  }

  create(
    conversion: Omit<UnitConversion, 'id' | 'companyId' | 'createdAt' | 'isActive'>,
  ): Observable<UnitConversion> {
    return this.http.post<UnitConversion>(this.apiUrl, conversion);
  }

  update(id: number, conversion: Partial<UnitConversion>): Observable<UnitConversion> {
    return this.http.patch<UnitConversion>(`${this.apiUrl}/${id}`, conversion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
