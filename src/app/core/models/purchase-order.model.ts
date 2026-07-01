import { Supplier } from './supplier.model';
import { Warehouse } from './warehouse.model';
import { Material } from './material.model';

export interface PurchaseOrder {
  id: number;
  warehouseId: number;
  supplierId: number;
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  total: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  items: POItem[];
  user?: { fullName: string };
}

export interface POItem {
  id: number;
  poId: number;
  materialId: number;
  unit: string;
  quantity: number;
  unitPrice: number;
  receivedQty: number;
  material?: Material;
}

export interface CreatePurchaseOrderRequest {
  warehouseId: number;
  supplierId: number;
  createdBy: number;
  notes?: string;
  items: POItemRequest[];
}

export interface POItemRequest {
  materialId: number;
  unitId: number;
  quantity: number;
  unitPrice: number;
}

export interface ReceivePurchaseOrderRequest {
  receivedBy: number;
  items: ReceiveItemRequest[];
}

export interface ReceiveItemRequest {
  poItemId: number;
  receivedQty: number;
  unitCost: number;
}

export interface UpdatePurchaseOrderRequest {
  status?: string;
  notes?: string;
}
