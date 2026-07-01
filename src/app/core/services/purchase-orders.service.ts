import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceivePurchaseOrderRequest,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly apiUrl = 'http://localhost:3000/purchase-orders';

  constructor(private http: HttpClient) {}

  getAll(warehouseId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}?warehouseId=${warehouseId}`);
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  create(data: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, data);
  }

  update(id: number, data: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, data);
  }

  receive(id: number, data: ReceivePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, data);
  }

  cancel(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, {});
  }

  delete(id: number): Observable<PurchaseOrder> {
    return this.http.delete<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }
}
