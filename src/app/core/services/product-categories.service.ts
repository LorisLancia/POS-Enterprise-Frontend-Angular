// src/app/core/services/product-categories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategory } from '../models/product.model';

export interface CreateProductCategoryDto {
  name: string;
  color?: string;
  sortOrder?: number;
  parentId?: number | null;
}

export interface UpdateProductCategoryDto {
  name?: string;
  color?: string;
  sortOrder?: number;
  parentId?: number | null;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductCategoriesService {
  private apiUrl = 'http://localhost:3000/product-categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.apiUrl);
  }

  create(dto: CreateProductCategoryDto): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateProductCategoryDto): Observable<ProductCategory> {
    return this.http.patch<ProductCategory>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
