import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly apiUrl = 'http://localhost:3000/suppliers';

  constructor(private http: HttpClient) {}

  getAll(companyId: number): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}?companyId=${companyId}`);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateSupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, data);
  }

  update(id: number, data: UpdateSupplierRequest): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<Supplier> {
    return this.http.delete<Supplier>(`${this.apiUrl}/${id}`);
  }
}
