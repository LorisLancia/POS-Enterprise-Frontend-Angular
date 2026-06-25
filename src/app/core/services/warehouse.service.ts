import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly apiUrl = 'http://localhost:3000/warehouses';

  constructor(private http: HttpClient) {}

  getAll(companyId: number): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}?companyId=${companyId}`);
  }

  getById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, data);
  }

  update(id: number, data: UpdateWarehouseRequest): Observable<Warehouse> {
    return this.http.patch<Warehouse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<Warehouse> {
    return this.http.delete<Warehouse>(`${this.apiUrl}/${id}`);
  }
}
