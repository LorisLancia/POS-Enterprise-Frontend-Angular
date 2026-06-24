import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesReport, Sale, Payment, SaleItem } from '../models/sale.model';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/sales';

  constructor(private http: HttpClient) {}

  getReport(from: string, to: string): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.apiUrl}/report?from=${from}&to=${to}`);
  }

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }
}
