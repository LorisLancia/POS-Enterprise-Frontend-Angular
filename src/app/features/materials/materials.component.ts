import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService, Material, InventoryItem } from '../../core/services/materials.service';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss',
})
export class MaterialsComponent implements OnInit {
  // Signals
  materials = signal<Material[]>([]);
  inventory = signal<InventoryItem[]>([]);
  loading = signal(false);
  error = signal('');
  activeTab = signal<'list' | 'inventory'>('list');

  editingMaterial = signal<Partial<Material> | null>(null);
  showForm = signal(false);

  formData: Partial<Material> = {
    name: '',
    description: '',
    unit: 'kg',
    costPerUnit: 0,
    minStockLevel: 0,
    supplierId: null,
    category: '',
    isActive: true,
  };

  warehouseId = 1;
  transactionMaterialId: number | null = null;
  transactionQty = 0;
  transactionType: 'IN' | 'OUT' | 'ADJUSTMENT' = 'IN';
  transactionNotes = '';

  // Computed
  isEditing = computed(() => this.editingMaterial() !== null);

  constructor(private materialsService: MaterialsService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading.set(true);
    this.error.set('');
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => {
        this.materials.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading materials: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  loadInventory(): void {
    this.loading.set(true);
    this.error.set('');
    this.materialsService.getInventory(this.warehouseId).subscribe({
      next: (data: InventoryItem[]) => {
        this.inventory.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading inventory: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  setTab(tab: 'list' | 'inventory'): void {
    this.activeTab.set(tab);
    if (tab === 'inventory') {
      this.loadInventory();
    }
  }

  openCreateForm(): void {
    this.editingMaterial.set(null);
    this.formData = {
      name: '',
      description: '',
      unit: 'kg',
      costPerUnit: 0,
      minStockLevel: 0,
      supplierId: null,
      category: '',
      isActive: true,
    };
    this.showForm.set(true);
  }

  openEditForm(material: Material): void {
    this.editingMaterial.set(material);
    this.formData = { ...material };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMaterial.set(null);
  }

  saveMaterial(): void {
    if (!this.formData.name || !this.formData.unit) {
      this.error.set('Name and unit are required');
      return;
    }

    this.loading.set(true);
    if (this.editingMaterial()?.id) {
      this.materialsService.update(this.editingMaterial()!.id!, this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadMaterials();
          this.closeForm();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error updating: ' + err.message);
        },
      });
    } else {
      this.materialsService
        .create(this.formData as Omit<Material, 'id' | 'createdAt' | 'updatedAt'>)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.loadMaterials();
            this.closeForm();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set('Error creating: ' + err.message);
          },
        });
    }
  }

  deleteMaterial(id: number): void {
    if (!confirm('Are you sure you want to delete this material?')) return;
    this.loading.set(true);
    this.materialsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadMaterials();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }

  submitTransaction(): void {
    if (!this.transactionMaterialId || !this.transactionQty) {
      this.error.set('Select a material and enter a valid quantity');
      return;
    }
    this.loading.set(true);
    this.materialsService
      .createTransaction({
        materialId: this.transactionMaterialId,
        warehouseId: this.warehouseId,
        quantity: this.transactionQty,
        type: this.transactionType,
        notes: this.transactionNotes,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadInventory();
          this.transactionQty = 0;
          this.transactionNotes = '';
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set('Error recording movement: ' + err.message);
        },
      });
  }
}
