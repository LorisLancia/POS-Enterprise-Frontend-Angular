// src/app/features/categories/categories.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProductCategoriesService,
  ProductCategory,
} from '../../core/services/product-categories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories = signal<ProductCategory[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingCategory = signal<ProductCategory | null>(null);

  formName = signal('');
  formColor = signal('');
  formSortOrder = signal(0);

  hasCategories = computed(() => this.categories().length > 0);
  isEditing = computed(() => this.editingCategory() !== null);

  constructor(private categoriesService: ProductCategoriesService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set('');
    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error loading categories: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingCategory.set(null);
    this.formName.set('');
    this.formColor.set('');
    this.formSortOrder.set(0);
    this.showForm.set(true);
  }

  openEditForm(category: ProductCategory): void {
    this.editingCategory.set(category);
    this.formName.set(category.name);
    this.formColor.set(category.color || '');
    this.formSortOrder.set(category.sortOrder);
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
      color: this.formColor() || undefined,
      sortOrder: this.formSortOrder() || undefined,
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
    if (!confirm('Delete this category?')) return;
    this.loading.set(true);
    this.categoriesService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadCategories();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }
}
