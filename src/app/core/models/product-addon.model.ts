// src/app/core/models/product-addon.model.ts
export interface ProductAddonItemDto {
  addonProductId: number;
  quantityValue?: number;
  sortOrder?: number;
}

export interface CreateProductAddonDto {
  productId: number;
  name: string;
  maxQuantity?: number;
  sortOrder?: number;
  items: ProductAddonItemDto[];
}

export interface UpdateProductAddonDto {
  name?: string;
  maxQuantity?: number;
  sortOrder?: number;
  isActive?: boolean;
  items?: ProductAddonItemDto[];
}
