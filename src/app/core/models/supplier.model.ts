export interface Supplier {
  id: number;
  companyId: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  purchaseOrders?: PurchaseOrderSummary[];
}

export interface PurchaseOrderSummary {
  id: number;
  status: string;
  total: number;
  createdAt: string;
}

export interface CreateSupplierRequest {
  companyId: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}
