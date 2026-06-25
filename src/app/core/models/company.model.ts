import { POSClient } from './pos-client.model';
import { Warehouse } from './warehouse.model';

export interface Company {
  id: number;
  name: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone: string;
  currency: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  warehouses?: Warehouse[];
  posClients?: POSClient[];
}

export interface CreateCompanyRequest {
  name: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
  logoUrl?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
  logoUrl?: string;
  isActive?: boolean;
}
