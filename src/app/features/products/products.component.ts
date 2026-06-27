// src/app/features/products/products.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { ProductCategoriesService } from '../../core/services/product-categories.service';
import { MaterialsService } from '../../core/services/materials.service';
import { Material } from '../../core/models/material.model';
import {
  Product,
  ModifierGroup,
  STANDARD_UNITS,
  ProductCategory,
} from '../../core/models/product.model';

type RecipeUnit = 'ML' | 'L' | 'G' | 'KG' | 'PC' | 'PK';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  materials = signal<Material[]>([]);
  modifierGroups = signal<ModifierGroup[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  editingProduct = signal<Product | null>(null);
  showForm = signal<boolean>(false);

  formData: Partial<Product> = {
    name: '',
    sku: '',
    basePrice: 0,
    cost: undefined,
    categoryId: undefined,
    barcode: '',
    description: '',
    isActive: true,
    taxRate: 0,
    trackInventory: true,
    allowDecimalQty: false,
  };

  formVariants = signal<{ name: string; sku: string; priceAdjustment: number }[]>([]);
  formRecipes = signal<
    {
      materialId: number;
      quantity: number;
      unit: RecipeUnit;
      wastagePercent: number;
    }[]
  >([]);
  formSelectedModifierIds = signal<number[]>([]);

  formAddons = signal<
    {
      name: string;
      maxQuantity: number;
      sortOrder: number;
      items: {
        addonProductId: number;
        quantityValue: number;
        price?: number;
        sortOrder: number;
      }[];
    }[]
  >([]);

  hasProducts = computed(() => this.products().length > 0);
  isEditing = computed(() => this.editingProduct() !== null);
  standardUnits = STANDARD_UNITS;

  constructor(
    private productsService: ProductsService,
    private categoriesService: ProductCategoriesService,
    private materialsService: MaterialsService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadMaterials();
    this.loadModifierGroups();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');
    this.productsService.getAll().subscribe({
      next: (data: Product[]) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading products: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (data: ProductCategory[]) => this.categories.set(data),
      error: () => {},
    });
  }

  loadMaterials(): void {
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => this.materials.set(data),
      error: () => {},
    });
  }

  loadModifierGroups(): void {
    this.productsService.getModifierGroups().subscribe({
      next: (data: ModifierGroup[]) => this.modifierGroups.set(data),
      error: () => {},
    });
  }

  refresh(): void {
    this.loadProducts();
  }

  openCreateForm(): void {
    this.formAddons.set([]);
    this.editingProduct.set(null);
    this.formData = {
      name: '',
      sku: '',
      basePrice: 0,
      cost: undefined,
      categoryId: undefined,
      barcode: '',
      description: '',
      isActive: true,
      taxRate: 0,
      trackInventory: true,
      allowDecimalQty: false,
    };
    this.formVariants.set([]);
    this.formRecipes.set([]);
    this.formSelectedModifierIds.set([]);
    this.showForm.set(true);
  }

  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    this.formData = { ...product };
    this.formVariants.set([]);
    this.formRecipes.set([]);
    this.formSelectedModifierIds.set([]);
    this.showForm.set(true);
    this.formAddons.set(
      product.addons?.map((a) => ({
        name: a.name,
        maxQuantity: a.maxQuantity,
        sortOrder: a.sortOrder,
        items:
          a.items?.map((item) => ({
            addonProductId: item.addonProductId,
            quantityValue: item.quantityValue,
            price: item.price,
            sortOrder: item.sortOrder,
          })) || [],
      })) || [],
    );
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  addVariant(): void {
    this.formVariants.update((v) => [...v, { name: '', sku: '', priceAdjustment: 0 }]);
  }
  removeVariant(index: number): void {
    this.formVariants.update((v) => v.filter((_, i) => i !== index));
  }
  updateVariant(
    index: number,
    field: 'name' | 'sku' | 'priceAdjustment',
    value: string | number,
  ): void {
    this.formVariants.update((v) => {
      const u = [...v];
      u[index] = { ...u[index], [field]: value };
      return u;
    });
  }

  addRecipe(): void {
    this.formRecipes.update((r) => [
      ...r,
      { materialId: 0, quantity: 1, unit: 'ML', wastagePercent: 0 },
    ]);
  }
  removeRecipe(index: number): void {
    this.formRecipes.update((r) => r.filter((_, i) => i !== index));
  }
  updateRecipe(
    index: number,
    field: 'materialId' | 'quantity' | 'unit' | 'wastagePercent',
    value: string | number,
  ): void {
    this.formRecipes.update((r) => {
      const u = [...r];
      u[index] = { ...u[index], [field]: value };
      return u;
    });
  }

  toggleModifierGroup(id: number): void {
    this.formSelectedModifierIds.update((ids) => {
      if (ids.includes(id)) {
        return ids.filter((i) => i !== id);
      }
      return [...ids, id];
    });
  }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.sku) {
      this.error.set('Name and SKU are required');
      return;
    }

    this.loading.set(true);
    const basePayload: any = {
      name: this.formData.name,
      sku: this.formData.sku,
      basePrice: Number(this.formData.basePrice) || 0,
      cost: this.formData.cost ? Number(this.formData.cost) : undefined,
      categoryId: this.formData.categoryId ? Number(this.formData.categoryId) : undefined,
      barcode: this.formData.barcode || undefined,
      description: this.formData.description || undefined,
      isActive: this.formData.isActive,
      taxRate: this.formData.taxRate ? Number(this.formData.taxRate) : undefined,
      trackInventory: this.formData.trackInventory,
      allowDecimalQty: this.formData.allowDecimalQty,
    };

    if (this.isEditing() && this.editingProduct()?.id) {
      this.productsService.update(this.editingProduct()!.id!, basePayload).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error updating: ' + err.message);
        },
      });
    } else {
      const payload = {
        ...basePayload,
        variants: this.formVariants()
          .filter((v) => v.name.trim())
          .map((v) => ({
            name: v.name,
            sku: v.sku || undefined,
            priceAdjustment: Number(v.priceAdjustment) || 0,
          })),
        recipes: this.formRecipes()
          .filter((r) => r.materialId > 0)
          .map((r) => ({
            materialId: Number(r.materialId),
            quantity: Number(r.quantity) || 1,
            unit: r.unit,
            wastagePercent: Number(r.wastagePercent) || 0,
          })),
        modifierGroupIds: this.formSelectedModifierIds(),
        addons: this.formAddons()
          .filter((a) => a.name.trim())
          .map((a) => ({
            name: a.name,
            maxQuantity: Number(a.maxQuantity) || 0,
            sortOrder: Number(a.sortOrder) || 0,
            items: a.items
              .filter((item) => item.addonProductId > 0)
              .map((item) => ({
                addonProductId: Number(item.addonProductId),
                quantityValue: Number(item.quantityValue) || 1,
                price: item.price !== undefined ? Number(item.price) : undefined,
                sortOrder: Number(item.sortOrder) || 0,
              })),
          })),
      };

      this.productsService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error creating: ' + err.message);
        },
      });
    }
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.loading.set(true);
    this.productsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadProducts();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }

  getCategoryName(categoryId?: number): string {
    return this.categories().find((c) => c.id === categoryId)?.name || '-';
  }

  getUnitLabel(unit: string): string {
    return this.standardUnits.find((u) => u.value === unit)?.label || unit;
  }

  // Ritorna categorie flat per dropdown (indentate per gerarchia)
  getFlatCategories(): ProductCategory[] {
    const result: ProductCategory[] = [];
    const walk = (cats: ProductCategory[], depth: number) => {
      for (const cat of cats) {
        result.push({ ...cat, name: '  '.repeat(depth) + cat.name });
        if (cat.children) walk(cat.children, depth + 1);
      }
    };
    walk(this.categories(), 0);
    return result;
  }

  addAddon(): void {
    this.formAddons.update((a) => [...a, { name: '', maxQuantity: 0, sortOrder: 0, items: [] }]);
  }

  removeAddon(index: number): void {
    this.formAddons.update((a) => a.filter((_, i) => i !== index));
  }

  updateAddon(
    index: number,
    field: 'name' | 'maxQuantity' | 'sortOrder',
    value: string | number,
  ): void {
    this.formAddons.update((a) => {
      const u = [...a];
      u[index] = { ...u[index], [field]: value };
      return u;
    });
  }

  addAddonItem(addonIndex: number): void {
    this.formAddons.update((a) => {
      const u = [...a];
      u[addonIndex] = {
        ...u[addonIndex],
        items: [
          ...u[addonIndex].items,
          { addonProductId: 0, quantityValue: 1, price: undefined, sortOrder: 0 },
        ],
      };
      return u;
    });
  }

  removeAddonItem(addonIndex: number, itemIndex: number): void {
    this.formAddons.update((a) => {
      const u = [...a];
      u[addonIndex] = {
        ...u[addonIndex],
        items: u[addonIndex].items.filter((_, i) => i !== itemIndex),
      };
      return u;
    });
  }

  updateAddonItem(
    addonIndex: number,
    itemIndex: number,
    field: 'addonProductId' | 'quantityValue' | 'price' | 'sortOrder',
    value: string | number,
  ): void {
    this.formAddons.update((a) => {
      const u = [...a];
      const items = [...u[addonIndex].items];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      u[addonIndex] = { ...u[addonIndex], items };
      return u;
    });
  }
}
