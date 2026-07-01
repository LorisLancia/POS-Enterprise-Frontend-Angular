import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InventoryItem,
  InventoryTransaction,
  CreateStartingBalanceRequest,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = 'http://localhost:3000/inventory';

  constructor(private http: HttpClient) {}

  createStartingBalance(data: CreateStartingBalanceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/starting-balance`, data);
  }

  getByWarehouse(warehouseId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/warehouse/${warehouseId}`);
  }

  getByCompany(companyId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/company/${companyId}`);
  }

  getTransactions(warehouseId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/transactions/${warehouseId}`);
  }
}
