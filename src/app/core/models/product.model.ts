// src/app/core/models/product.model.ts

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string | null;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
}

export interface ProductRecipe {
  id: number;
  productId: number;
  variantId: number | null;
  materialId: number;
  quantity: number;
  unit: 'ML' | 'L' | 'G' | 'KG' | 'PC' | 'PK';
  wastagePercent: number;
  material?: { id: number; name: string; units?: { unit: string; quantity: number }[] };
  variant?: ProductVariant;
}

export interface ModifierOption {
  id: number;
  groupId: number;
  name: string;
  priceAdjustment: number;
  materialId: number | null;
  quantityConsumed: number | null;
  isActive: boolean;
}

export interface ModifierGroup {
  id: number;
  companyId: number;
  name: string;
  selectionType: string;
  minSelect: number;
  maxSelect: number;
  isActive: boolean;
  options: ModifierOption[];
}

export interface ProductModifier {
  id: number;
  productId: number;
  groupId: number;
  isRequired: boolean;
  sortOrder: number;
  group: ModifierGroup;
}

export interface ProductAddonItem {
  id: number;
  addonId: number;
  addonProductId: number;
  quantityValue: number;
  sortOrder: number;
  isActive: boolean;
  addonProduct?: Product;
}

export interface ProductAddon {
  id: number;
  productId: number;
  name: string;
  maxQuantity: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  items: ProductAddonItem[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  cost?: number;
  sku: string;
  barcode?: string;
  categoryId?: number;
  category?: ProductCategory;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  taxRate?: number;
  trackInventory?: boolean;
  allowDecimalQty?: boolean;
  variants?: ProductVariant[];
  recipes?: ProductRecipe[];
  modifiers?: ProductModifier[];
  addons?: ProductAddon[];
}

export interface ProductCategory {
  id: number;
  companyId: number;
  parentId: number | null;
  name: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: ProductCategory[];
  parent?: ProductCategory;
  createdAt?: string;
  updatedAt?: string;
}

// Standard units for dropdowns
export const STANDARD_UNITS: { value: ProductRecipe['unit']; label: string }[] = [
  { value: 'ML', label: 'Milliliter (ml)' },
  { value: 'L', label: 'Liter (l)' },
  { value: 'G', label: 'Gram (g)' },
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'PC', label: 'Piece (pc)' },
  { value: 'PK', label: 'Pack (pk)' },
];
