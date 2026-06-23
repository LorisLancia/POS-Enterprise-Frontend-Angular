import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  id: number;
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
  minStockLevel: number;
  supplierId: number | null;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  materialId: number;
  materialName: string;
  quantity: number;
  unit: string;
  warehouseId: number;
  updatedAt: string;
}

export interface InventoryTransactionDto {
  materialId: number;
  warehouseId: number;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialsService {
  private apiUrl = 'http://localhost:3000/materials';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  getById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  create(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  update(id: number, material: Partial<Material>): Observable<Material> {
    return this.http.patch<Material>(`${this.apiUrl}/${id}`, material);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getInventory(warehouseId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory/${warehouseId}`);
  }

  createTransaction(dto: InventoryTransactionDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory/transaction`, dto);
  }
}
