import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { ProductCategoriesService } from '../../core/services/product-categories.service';
import { MaterialsService } from '../../core/services/materials.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { Material } from '../../core/models/material.model';
import {
  Product,
  ModifierGroup,
  STANDARD_UNITS,
  ProductCategory,
} from '../../core/models/product.model';
import { AddonGroupsService } from '../../core/services/addon-groups.service';
import { AddonGroup } from '../../core/models/addon-group.model';

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
  addonGroups = signal<AddonGroup[]>([]);
  formSelectedAddonGroupIds = signal<number[]>([]);

  showInactive = signal<boolean>(false);
  searchTerm = signal<string>('');

  selectedCategoryPath = signal<number[]>([]);

  editingProduct = signal<Product | null>(null);
  showForm = signal<boolean>(false);

  formData = signal<Partial<Product>>({
    name: '',
    sku: '',
    basePrice: 0,
    categoryId: undefined,
    barcode: '',
    description: '',
    isActive: true,
    taxRate: 0,
    trackInventory: true,
    allowDecimalQty: false,
  });

  formVariants = signal<
    {
      id?: number;
      name: string;
      sku: string;
      priceAdjustment: number;
      recipes: {
        materialId: number;
        quantity: number;
        unit: RecipeUnit;
        wastagePercent: number;
      }[];
    }[]
  >([]);

  formSelectedModifierIds = signal<number[]>([]);

  readonly filteredProducts = computed(() => {
    let list = this.products();
    if (!this.showInactive()) {
      list = list.filter((p) => p.isActive);
    }
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(term)),
      );
    }
    return list;
  });

  hasProducts = computed(() => this.filteredProducts().length > 0);
  isEditing = computed(() => this.editingProduct() !== null);
  standardUnits = STANDARD_UNITS;

  constructor(
    private productsService: ProductsService,
    private categoriesService: ProductCategoriesService,
    private materialsService: MaterialsService,
    private confirmDialog: ConfirmDialogService,
    private toast: ToastService,
    private addonGroupsService: AddonGroupsService,
  ) {}

  updateFormData(field: keyof Product, value: any): void {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  categoryLevels = computed(() => {
    const path = this.selectedCategoryPath();
    const levels: ProductCategory[][] = [];
    levels.push(this.categories().filter((c) => !c.parentId));
    for (let i = 0; i < path.length; i++) {
      const parentId = path[i];
      const parent = this.findCategoryById(parentId);
      if (parent?.children && parent.children.length > 0) {
        levels.push(parent.children);
      }
    }
    return levels;
  });

  finalCategoryId = computed(() => {
    const path = this.selectedCategoryPath();
    return path.length > 0 ? path[path.length - 1] : undefined;
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadMaterials();
    this.loadModifierGroups();
    this.loadAddonGroups();
  }

  selectCategoryLevel(levelIndex: number, categoryId: number | undefined): void {
    this.selectedCategoryPath.update((path) => {
      const newPath = path.slice(0, levelIndex);
      if (categoryId) {
        newPath.push(categoryId);
      }
      return newPath;
    });
    const finalId = this.finalCategoryId();
    this.updateFormData('categoryId', finalId);
  }

  loadAddonGroups(): void {
    this.addonGroupsService.getAll().subscribe({
      next: (data: AddonGroup[]) => this.addonGroups.set(data),
      error: () => {},
    });
  }

  toggleAddonGroup(id: number): void {
    this.formSelectedAddonGroupIds.update((ids) => {
      if (ids.includes(id)) {
        return ids.filter((i) => i !== id);
      }
      return [...ids, id];
    });
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
        this.loading.set(false);
        this.toast.error('Error loading products: ' + (err.message || 'Unknown error'));
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
    this.formSelectedAddonGroupIds.set([]);
    this.editingProduct.set(null);
    this.formData.set({
      name: '',
      sku: '',
      basePrice: 0,
      categoryId: undefined,
      barcode: '',
      description: '',
      isActive: true,
      taxRate: 0,
      trackInventory: true,
      allowDecimalQty: false,
    });
    this.formVariants.set([]);
    this.formSelectedModifierIds.set([]);
    this.selectedCategoryPath.set([]);
    this.showForm.set(true);
  }

  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    const { cost, ...productWithoutCost } = product as any;
    this.formData.set({ ...productWithoutCost });

    this.formVariants.set(
      product.variants?.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || '',
        priceAdjustment: v.priceAdjustment,
        recipes:
          product.recipes
            ?.filter((r) => r.variantId === v.id)
            ?.map((r) => ({
              materialId: r.materialId,
              quantity: r.quantity,
              unit: r.unit,
              wastagePercent: r.wastagePercent,
            })) || [],
      })) || [],
    );

    this.formSelectedModifierIds.set(product.modifiers?.map((m) => m.groupId) || []);
    this.formSelectedAddonGroupIds.set(product.addonGroups?.map((a) => a.groupId) || []);

    const catId = product.categoryId;
    if (catId) {
      const path = this.buildCategoryPath(catId);
      this.selectedCategoryPath.set(path);
    } else {
      this.selectedCategoryPath.set([]);
    }

    this.showForm.set(true);
  }

  buildCategoryPath(leafId: number): number[] {
    const path: number[] = [];
    let current = this.findCategoryById(leafId);
    while (current) {
      path.unshift(current.id);
      if (current.parentId) {
        current = this.findCategoryById(current.parentId);
      } else {
        break;
      }
    }
    return path;
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  addVariant(): void {
    this.formVariants.update((v) => [...v, { name: '', sku: '', priceAdjustment: 0, recipes: [] }]);
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
  addVariantRecipe(variantIndex: number): void {
    this.formVariants.update((v) => {
      const u = [...v];
      u[variantIndex] = {
        ...u[variantIndex],
        recipes: [
          ...u[variantIndex].recipes,
          { materialId: 0, quantity: 1, unit: 'ML', wastagePercent: 0 },
        ],
      };
      return u;
    });
  }

  removeVariantRecipe(variantIndex: number, recipeIndex: number): void {
    this.formVariants.update((v) => {
      const u = [...v];
      u[variantIndex] = {
        ...u[variantIndex],
        recipes: u[variantIndex].recipes.filter((_, i) => i !== recipeIndex),
      };
      return u;
    });
  }

  updateVariantRecipe(
    variantIndex: number,
    recipeIndex: number,
    field: 'materialId' | 'quantity' | 'unit' | 'wastagePercent',
    value: string | number,
  ): void {
    this.formVariants.update((v) => {
      const u = [...v];
      const recipes = [...u[variantIndex].recipes];
      recipes[recipeIndex] = { ...recipes[recipeIndex], [field]: value };
      u[variantIndex] = { ...u[variantIndex], recipes };
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
    const data = this.formData();
    if (!data.name || !data.sku) {
      this.toast.error('Name and SKU are required');
      return;
    }

    this.loading.set(true);
    const basePayload: any = {
      name: data.name,
      sku: data.sku,
      basePrice: Number(data.basePrice) || 0,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      barcode: data.barcode || undefined,
      description: data.description || undefined,
      isActive: data.isActive,
      taxRate: data.taxRate ? Number(data.taxRate) : undefined,
      trackInventory: data.trackInventory,
      allowDecimalQty: data.allowDecimalQty,
    };

    if (this.isEditing() && this.editingProduct()?.id) {
      const payload = {
        ...basePayload,
        variants: this.formVariants().map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || undefined,
          priceAdjustment: Number(v.priceAdjustment) || 0,
          recipes: v.recipes
            .filter((r) => r.materialId > 0)
            .map((r) => ({
              materialId: Number(r.materialId),
              quantity: Number(r.quantity) || 1,
              unit: r.unit,
              wastagePercent: Number(r.wastagePercent) || 0,
            })),
        })),
        modifierGroupIds: this.formSelectedModifierIds(),
        addonGroupIds: this.formSelectedAddonGroupIds(),
      };

      this.productsService.update(this.editingProduct()!.id!, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Product updated');
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.toast.error('Error updating: ' + err.message);
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
            recipes: v.recipes
              .filter((r) => r.materialId > 0)
              .map((r) => ({
                materialId: Number(r.materialId),
                quantity: Number(r.quantity) || 1,
                unit: r.unit,
                wastagePercent: Number(r.wastagePercent) || 0,
              })),
          })),
        modifierGroupIds: this.formSelectedModifierIds(),
        addonGroupIds: this.formSelectedAddonGroupIds(),
      };

      this.productsService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Product created');
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.toast.error('Error creating: ' + err.message);
        },
      });
    }
  }

  deleteProduct(id: number): void {
    this.confirmDialog.open({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: () => {
        this.loading.set(true);
        this.productsService.delete(id).subscribe({
          next: () => {
            this.loading.set(false);
            this.toast.success('Product deleted');
            this.loadProducts();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.toast.error('Error deleting: ' + err.message);
          },
        });
      },
    });
  }

  getCategoryName(categoryId?: number): string {
    return this.findCategoryById(categoryId)?.name || '-';
  }

  getUnitLabel(unit: string): string {
    return this.standardUnits.find((u) => u.value === unit)?.label || unit;
  }

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

  findCategoryById(
    id: number | undefined,
    cats: ProductCategory[] = this.categories(),
  ): ProductCategory | undefined {
    if (!id) return undefined;
    for (const cat of cats) {
      if (cat.id === id) {
        return cat;
      }
      if (cat.children && cat.children.length > 0) {
        const found = this.findCategoryById(id, cat.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  getCategoryHierarchy(categoryId?: number): string {
    if (!categoryId) return '-';
    const path: string[] = [];
    let current = this.findCategoryById(categoryId);
    while (current) {
      path.unshift(current.name);
      if (current.parentId) {
        current = this.findCategoryById(current.parentId);
      } else {
        break;
      }
    }
    return path.length > 0 ? path.join(' → ') : '-';
  }
}
