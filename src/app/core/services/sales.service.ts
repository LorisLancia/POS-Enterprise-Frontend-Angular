import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: number;
  method: string;
  amount: number;
}

export interface Sale {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: SaleItem[];
  payments: Payment[];
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageTicket: number;
  };
  sales: Sale[];
}

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
