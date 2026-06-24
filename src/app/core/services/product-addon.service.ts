import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductAddon } from '../models/product.model';

export interface CreateProductAddonDto {
  productId: number;
  name: string;
  maxQuantity?: number;
  sortOrder?: number;
  items: { addonProductId: number; quantityValue?: number; sortOrder?: number }[];
}

export interface UpdateProductAddonDto {
  name?: string;
  maxQuantity?: number;
  sortOrder?: number;
  isActive?: boolean;
  items?: { addonProductId: number; quantityValue?: number; sortOrder?: number }[];
}

@Injectable({ providedIn: 'root' })
export class ProductAddonService {
  private apiUrl = 'http://localhost:3000/product-addons';
  constructor(private http: HttpClient) {}

  getByProduct(productId: number): Observable<ProductAddon[]> {
    return this.http.get<ProductAddon[]>(`${this.apiUrl}/product/${productId}`);
  }
  getById(id: number): Observable<ProductAddon> {
    return this.http.get<ProductAddon>(`${this.apiUrl}/${id}`);
  }
  create(dto: CreateProductAddonDto): Observable<ProductAddon> {
    return this.http.post<ProductAddon>(this.apiUrl, dto);
  }
  update(id: number, dto: UpdateProductAddonDto): Observable<ProductAddon> {
    return this.http.patch<ProductAddon>(`${this.apiUrl}/${id}`, dto);
  }
  delete(id: number): Observable<ProductAddon> {
    return this.http.delete<ProductAddon>(`${this.apiUrl}/${id}`);
  }
}
