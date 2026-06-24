import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAddonManagerComponent } from './product-addon-manager/product-addon-manager.component';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductAddonManagerComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  // Signals
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal('');
  showAddonManager = signal(false);
  selectedProductForAddons = signal<Product | null>(null);
  isAddonManagerOpen = computed(
    () => this.showAddonManager() && this.selectedProductForAddons() !== null,
  );

  editingProduct = signal<Partial<Product> | null>(null);
  showForm = signal(false);

  formData: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    cost: 0,
    sku: '',
    barcode: '',
    category: '',
    isActive: true,
    storeId: 1,
  };

  // Computed read-only
  hasProducts = computed(() => this.products().length > 0);
  isEditing = computed(() => this.editingProduct() !== null);

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
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
        console.error(err);
      },
    });
  }

  refresh(): void {
    this.loadProducts();
  }

  openCreateForm(): void {
    this.editingProduct.set(null);
    this.formData = {
      name: '',
      description: '',
      price: 0,
      cost: 0,
      sku: '',
      barcode: '',
      category: '',
      isActive: true,
      storeId: 1,
    };
    this.showForm.set(true);
  }

  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    this.formData = { ...product };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.sku) {
      this.error.set('Name and SKU are required');
      return;
    }

    this.loading.set(true);
    if (this.editingProduct()?.id) {
      this.productsService.update(this.editingProduct()!.id!, this.formData).subscribe({
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
      this.productsService
        .create(this.formData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>)
        .subscribe({
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
  //addon manager methods
  openAddonManager(product: Product): void {
    this.selectedProductForAddons.set(product);
    this.showAddonManager.set(true);
    this.showForm.set(false);
  }
  closeAddonManager(): void {
    this.showAddonManager.set(false);
    this.selectedProductForAddons.set(null);
  }
}
