import { Material } from './material.model';
import { Warehouse } from './warehouse.model';

export interface InventoryItem {
  id: number;
  warehouseId: number;
  materialId: number;
  unit: string;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: string;
  material?: Material;
  warehouse?: Warehouse;
}

export interface InventoryTransaction {
  id: number;
  warehouseId: number;
  materialId: number;
  type: string;
  unit: string;
  quantity: number;
  unitCost?: number;
  referenceId?: number;
  referenceType?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  material?: Material;
  user?: { fullName: string };
}

export interface StartingBalanceItemRequest {
  materialId: number;
  unitId: number;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface CreateStartingBalanceRequest {
  warehouseId: number;
  createdBy: number;
  items: StartingBalanceItemRequest[];
}
