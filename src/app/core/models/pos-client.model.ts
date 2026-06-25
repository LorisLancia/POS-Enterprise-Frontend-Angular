import { Company } from './company.model';
import { Warehouse } from './warehouse.model';

export interface POSClient {
  id: number;
  companyId: number;
  warehouseId: number;
  name: string;
  location?: string;
  hardwareId: string;
  lastSyncAt?: string;
  isActive: boolean;
  createdAt: string;
  company?: Company;
  warehouse?: Warehouse;
}

export interface CreatePOSClientRequest {
  companyId: number;
  warehouseId: number;
  name: string;
  location?: string;
  hardwareId: string;
}

export interface UpdatePOSClientRequest {
  warehouseId?: number;
  name?: string;
  location?: string;
  hardwareId?: string;
  isActive?: boolean;
}
