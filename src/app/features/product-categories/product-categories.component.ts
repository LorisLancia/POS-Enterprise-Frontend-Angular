// src/app/features/product-categories/product-categories.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCategoriesService } from '../../core/services/product-categories.service';
import { ProductCategory } from '../../core/models/product.model';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss',
})
export class ProductCategoriesComponent implements OnInit {
  categories = signal<ProductCategory[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  showForm = signal<boolean>(false);
  editingCategory = signal<ProductCategory | null>(null);

  formName = signal<string>('');
  formColor = signal<string>('#3b82f6');
  formSortOrder = signal<number>(0);
  formParentId = signal<number | null>(null);

  hasCategories = computed(() => this.categories().length > 0);
  isEditing = computed(() => this.editingCategory() !== null);

  constructor(
    private categoriesService: ProductCategoriesService,
    private confirmDialog: ConfirmDialogService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set('');
    this.categoriesService.getAll().subscribe({
      next: (data: ProductCategory[]) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingCategory.set(null);
    this.formName.set('');
    this.formColor.set('#3b82f6');
    this.formSortOrder.set(0);
    this.formParentId.set(null);
    this.showForm.set(true);
  }

  openEditForm(cat: ProductCategory): void {
    this.editingCategory.set(cat);
    this.formName.set(cat.name);
    this.formColor.set(cat.color || '#3b82f6');
    this.formSortOrder.set(cat.sortOrder);
    this.formParentId.set(cat.parentId);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
  }

  saveCategory(): void {
    if (!this.formName()) {
      this.error.set('Name is required');
      return;
    }

    this.loading.set(true);
    const dto = {
      name: this.formName(),
      color: this.formColor(),
      sortOrder: this.formSortOrder(),
      parentId: this.formParentId(),
    };

    const op =
      this.isEditing() && this.editingCategory()
        ? this.categoriesService.update(this.editingCategory()!.id, dto)
        : this.categoriesService.create(dto);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.loadCategories();
        this.closeForm();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteCategory(id: number): void {
    this.confirmDialog.open({
      title: 'Delete Category',
      message: 'This will delete the category and all its children. Are you sure?',
      confirmText: 'Delete',
      onConfirm: () => {
        this.loading.set(true);
        this.categoriesService.delete(id).subscribe({
          next: () => {
            this.loading.set(false);
            this.toast.success('Category deleted');
            this.loadCategories();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set('Error deleting: ' + err.message);
            this.toast.error('Failed to delete category');
          },
        });
      },
    });
  }

  // Ritorna tutte le categorie flat per il dropdown parent (esclude se stessa e discendenti)
  getFlatCategories(excludeId?: number): ProductCategory[] {
    const result: ProductCategory[] = [];
    const walk = (cats: ProductCategory[], depth: number) => {
      for (const cat of cats) {
        if (cat.id !== excludeId) {
          result.push({ ...cat, name: '  '.repeat(depth) + cat.name });
          if (cat.children) walk(cat.children, depth + 1);
        }
      }
    };
    walk(this.categories(), 0);
    return result;
  }
}
