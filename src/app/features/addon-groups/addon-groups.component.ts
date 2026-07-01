import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddonGroupsService } from '../../core/services/addon-groups.service';
import { ProductsService } from '../../core/services/products.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { AddonGroup, AddonGroupItem } from '../../core/models/addon-group.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-addon-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './addon-groups.component.html',
  styleUrl: './addon-groups.component.scss',
})
export class AddonGroupsComponent implements OnInit {
  addonGroups = signal<AddonGroup[]>([]);
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  editingGroup = signal<AddonGroup | null>(null);
  showForm = signal<boolean>(false);

  formData = signal<Partial<AddonGroup>>({
    name: '',
    maxQuantity: 0,
    sortOrder: 0,
  });

  formItems = signal<
    {
      addonProductId: number;
      quantityValue: number;
      price?: number;
      sortOrder: number;
    }[]
  >([]);

  hasGroups = computed(() => this.addonGroups().length > 0);
  isEditing = computed(() => this.editingGroup() !== null);

  constructor(
    private addonGroupsService: AddonGroupsService,
    private productsService: ProductsService,
    private confirmDialog: ConfirmDialogService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadAddonGroups();
    this.loadProducts();
  }

  loadAddonGroups(): void {
    this.loading.set(true);
    this.error.set('');
    this.addonGroupsService.getAll().subscribe({
      next: (data: AddonGroup[]) => {
        this.addonGroups.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading addon groups: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data: Product[]) => this.products.set(data),
      error: () => {},
    });
  }

  refresh(): void {
    this.loadAddonGroups();
  }

  openCreateForm(): void {
    this.editingGroup.set(null);
    this.formData.set({ name: '', maxQuantity: 0, sortOrder: 0 });
    this.formItems.set([]);
    this.showForm.set(true);
  }

  openEditForm(group: AddonGroup): void {
    this.editingGroup.set(group);
    this.formData.set({ ...group });
    this.formItems.set(
      group.items?.map((item) => ({
        addonProductId: item.addonProductId,
        quantityValue: item.quantityValue,
        price: item.price,
        sortOrder: item.sortOrder,
      })) || [],
    );
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingGroup.set(null);
  }

  updateFormData(field: keyof AddonGroup, value: any): void {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  addItem(): void {
    this.formItems.update((items) => [
      ...items,
      { addonProductId: 0, quantityValue: 1, sortOrder: 0 },
    ]);
  }

  removeItem(index: number): void {
    this.formItems.update((items) => items.filter((_, i) => i !== index));
  }

  updateItem(
    index: number,
    field: 'addonProductId' | 'quantityValue' | 'price' | 'sortOrder',
    value: string | number | undefined,
  ): void {
    this.formItems.update((items) => {
      const u = [...items];
      u[index] = { ...u[index], [field]: value };
      return u;
    });
  }

  saveGroup(): void {
    const data = this.formData();
    if (!data.name) {
      this.error.set('Name is required');
      return;
    }

    this.loading.set(true);
    const payload = {
      name: data.name,
      maxQuantity: Number(data.maxQuantity) || 0,
      sortOrder: Number(data.sortOrder) || 0,
      items: this.formItems()
        .filter((item) => item.addonProductId > 0)
        .map((item) => ({
          addonProductId: Number(item.addonProductId),
          quantityValue: Number(item.quantityValue) || 1,
          price: item.price !== undefined ? Number(item.price) : undefined,
          sortOrder: Number(item.sortOrder) || 0,
        })),
    };

    if (this.isEditing() && this.editingGroup()?.id) {
      this.addonGroupsService.update(this.editingGroup()!.id!, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Addon group updated');
          this.loadAddonGroups();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error updating: ' + err.message);
          this.toast.error('Failed to update addon group');
        },
      });
    } else {
      this.addonGroupsService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Addon group created');
          this.loadAddonGroups();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error creating: ' + err.message);
          this.toast.error('Failed to create addon group');
        },
      });
    }
  }

  deleteGroup(id: number): void {
    this.confirmDialog.open({
      title: 'Delete Addon Group',
      message: 'Are you sure? This will remove the addon group from all linked products.',
      confirmText: 'Delete',
      onConfirm: () => {
        this.loading.set(true);
        this.addonGroupsService.delete(id).subscribe({
          next: () => {
            this.loading.set(false);
            this.toast.success('Addon group deleted');
            this.loadAddonGroups();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set('Error deleting: ' + err.message);
            this.toast.error('Failed to delete addon group');
          },
        });
      },
    });
  }
}
