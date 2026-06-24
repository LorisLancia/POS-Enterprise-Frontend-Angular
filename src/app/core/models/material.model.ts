// src/app/core/models/material.model.ts
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
