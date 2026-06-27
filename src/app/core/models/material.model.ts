// src/app/core/models/material.model.ts

export interface MaterialUnit {
  id?: number;
  materialId?: number;
  unit: 'ML' | 'L' | 'G' | 'KG' | 'PC' | 'PK';
  quantity: number;
  isDefault: boolean;
  isPurchaseUnit: boolean;
  isSaleUnit: boolean;
  isActive: boolean;
}

export interface Material {
  id: number;
  companyId: number;
  name: string;
  description: string;
  category: string;
  minStock: number; // allineato al backend Prisma
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  units: MaterialUnit[];
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
