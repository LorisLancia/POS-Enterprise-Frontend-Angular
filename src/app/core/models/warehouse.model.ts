import { Company } from './company.model';
import { POSClient } from './pos-client.model';

export interface Warehouse {
  id: number;
  companyId: number;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  company?: Company;
  posClients?: POSClient[];
}

export interface CreateWarehouseRequest {
  companyId: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}
