import { Product } from './product.model';

export interface AddonGroup {
  id: number;
  companyId: number;
  name: string;
  maxQuantity: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  items: AddonGroupItem[];
}

export interface AddonGroupItem {
  id: number;
  groupId: number;
  addonProductId: number;
  addonProduct?: Product;
  quantityValue: number;
  price?: number;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductAddon {
  id: number;
  productId: number;
  groupId: number;
  sortOrder: number;
  isActive: boolean;
  group: AddonGroup;
}

export interface CreateAddonGroupDto {
  name: string;
  maxQuantity?: number;
  sortOrder?: number;
  items: {
    addonProductId: number;
    quantityValue?: number;
    price?: number;
    sortOrder?: number;
  }[];
}

export interface UpdateAddonGroupDto {
  name?: string;
  maxQuantity?: number;
  sortOrder?: number;
  isActive?: boolean;
  items?: {
    addonProductId: number;
    quantityValue?: number;
    price?: number;
    sortOrder?: number;
  }[];
}
