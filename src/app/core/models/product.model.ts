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
  unit: string;
  wastagePercent: number;
  material?: { id: number; name: string; unit: string };
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
  storeId: number;
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
  description: string;
  price: number;
  cost: number;
  sku: string;
  barcode: string;
  category: string;
  isActive: boolean;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  basePrice?: number;
  taxRate?: number;
  categoryId?: number;
  trackInventory?: boolean;
  allowDecimalQty?: boolean;
  variants?: ProductVariant[];
  recipes?: ProductRecipe[];
  modifiers?: ProductModifier[];
  addons?: ProductAddon[];
}
