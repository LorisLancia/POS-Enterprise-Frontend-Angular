// src/app/core/models/sale.model.ts
export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: number;
  method: string;
  amount: number;
}

export interface Sale {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: SaleItem[];
  payments: Payment[];
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageTicket: number;
  };
  sales: Sale[];
}
