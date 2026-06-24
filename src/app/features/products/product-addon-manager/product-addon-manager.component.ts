import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAddon, Product } from '../../../core/models/product.model';
import { ProductAddonService } from '../../../core/services/product-addon.service';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-addon-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-addon-manager.component.html',
  styleUrl: './product-addon-manager.component.scss',
})
export class ProductAddonManagerComponent implements OnInit {
  @Input({ required: true }) productId!: number;

  addons = signal<ProductAddon[]>([]);
  availableProducts = signal<Product[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingAddon = signal<ProductAddon | null>(null);

  formName = signal('');
  formMaxQuantity = signal(0);
  formSortOrder = signal(0);
  formItems = signal<{ addonProductId: number; quantityValue: number; sortOrder: number }[]>([]);

  hasAddons = computed(() => this.addons().length > 0);
  isEditing = computed(() => this.editingAddon() !== null);

  constructor(
    private addonService: ProductAddonService,
    private productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    this.loadAddons();
    this.loadAvailableProducts();
  }

  loadAddons(): void {
    this.loading.set(true);
    this.error.set('');
    this.addonService.getByProduct(this.productId).subscribe({
      next: (data) => {
        this.addons.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  loadAvailableProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.availableProducts.set(data.filter((p) => p.id !== this.productId && p.isActive));
      },
      error: () => {},
    });
  }

  openCreateForm(): void {
    this.editingAddon.set(null);
    this.formName.set('');
    this.formMaxQuantity.set(0);
    this.formSortOrder.set(0);
    this.formItems.set([]);
    this.showForm.set(true);
  }

  openEditForm(addon: ProductAddon): void {
    this.editingAddon.set(addon);
    this.formName.set(addon.name);
    this.formMaxQuantity.set(addon.maxQuantity);
    this.formSortOrder.set(addon.sortOrder);
    this.formItems.set(
      addon.items.map((i) => ({
        addonProductId: i.addonProductId,
        quantityValue: i.quantityValue,
        sortOrder: i.sortOrder,
      })),
    );
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingAddon.set(null);
  }

  addItem(): void {
    this.formItems.update((items) => [
      ...items,
      { addonProductId: 0, quantityValue: 1, sortOrder: items.length },
    ]);
  }
  removeItem(index: number): void {
    this.formItems.update((items) => items.filter((_, i) => i !== index));
  }
  updateItemProduct(index: number, productId: number): void {
    this.formItems.update((items) => {
      const u = [...items];
      u[index] = { ...u[index], addonProductId: Number(productId) };
      return u;
    });
  }
  updateItemQuantityValue(index: number, value: number): void {
    this.formItems.update((items) => {
      const u = [...items];
      u[index] = { ...u[index], quantityValue: Number(value) || 1 };
      return u;
    });
  }
  updateItemSortOrder(index: number, value: number): void {
    this.formItems.update((items) => {
      const u = [...items];
      u[index] = { ...u[index], sortOrder: Number(value) || 0 };
      return u;
    });
  }

  saveAddon(): void {
    if (!this.formName()) {
      this.error.set('Name is required');
      return;
    }
    const items = this.formItems().filter((i) => i.addonProductId > 0);
    if (items.length === 0) {
      this.error.set('At least one addon product is required');
      return;
    }

    this.loading.set(true);
    const payload = {
      name: this.formName(),
      maxQuantity: this.formMaxQuantity(),
      sortOrder: this.formSortOrder(),
      items,
    };
    const op =
      this.isEditing() && this.editingAddon()
        ? this.addonService.update(this.editingAddon()!.id, payload)
        : this.addonService.create({ productId: this.productId, ...payload });

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.loadAddons();
        this.closeForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteAddon(id: number): void {
    if (!confirm('Delete this addon group?')) return;
    this.loading.set(true);
    this.addonService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadAddons();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  getProductName(productId: number): string {
    return (
      this.availableProducts().find((p) => p.id === productId)?.name || `Product #${productId}`
    );
  }
}
