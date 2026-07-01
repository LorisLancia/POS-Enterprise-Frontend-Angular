import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService } from '../../core/services/materials.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Material, MaterialUnit } from '../../core/models/material.model';

const STANDARD_UNITS: { value: MaterialUnit['unit']; label: string }[] = [
  { value: 'ML', label: 'Milliliter (ml)' },
  { value: 'L', label: 'Liter (l)' },
  { value: 'G', label: 'Gram (g)' },
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'PC', label: 'Piece (pc)' },
  { value: 'PK', label: 'Pack (pk)' },
];

interface MaterialFormData {
  name: string;
  description: string;
  category: string;
  newCategory: string;
  minStock: number;
  isActive: boolean;
  units: MaterialUnit[];
}

interface CreateMaterialDto {
  name: string;
  description?: string;
  category?: string;
  minStock?: string;
  isActive?: boolean;
  units: {
    unit: MaterialUnit['unit'];
    quantity: string;
    isDefault?: boolean;
    isPurchaseUnit?: boolean;
    isSaleUnit?: boolean;
  }[];
}

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss'],
})
export class MaterialsComponent implements OnInit {
  materials = signal<Material[]>([]);
  loading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  editingMaterial = signal<Material | null>(null);

  showInactive = signal<boolean>(false);
  searchTerm = signal<string>('');

  formData = signal<MaterialFormData>({
    name: '',
    description: '',
    category: '',
    newCategory: '',
    minStock: 0,
    isActive: true,
    units: [],
  });

  existingCategories = computed(() => {
    const cats = this.materials()
      .map((m) => m.category)
      .filter((c): c is string => !!c && c !== '');
    return [...new Set(cats)].sort();
  });

  readonly filteredMaterials = computed(() => {
    let list = this.materials();
    if (!this.showInactive()) {
      list = list.filter((m) => m.isActive);
    }
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          (m.category && m.category.toLowerCase().includes(term)),
      );
    }
    return list;
  });

  hasMaterials = computed(() => this.filteredMaterials().length > 0);
  isEditing = computed(() => this.editingMaterial() !== null);
  showNewCategoryInput = computed(() => this.formData().category === '__new__');
  standardUnits = STANDARD_UNITS;

  constructor(
    private materialsService: MaterialsService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading.set(true);
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => {
        this.materials.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toast.error('Failed to load materials: ' + (err.message || 'Unknown'));
      },
    });
  }

  refresh(): void {
    this.loadMaterials();
  }

  openCreateForm(): void {
    this.editingMaterial.set(null);
    this.formData.set({
      name: '',
      description: '',
      category: '',
      newCategory: '',
      minStock: 0,
      isActive: true,
      units: [],
    });
    this.showForm.set(true);
  }

  openEditForm(mat: Material): void {
    this.editingMaterial.set(mat);
    const existing = this.existingCategories();
    const isNewCat = mat.category ? !existing.includes(mat.category) : false;

    this.formData.set({
      name: mat.name,
      description: mat.description || '',
      category: isNewCat ? '__new__' : mat.category || '',
      newCategory: isNewCat ? mat.category || '' : '',
      minStock: mat.minStock || 0,
      isActive: mat.isActive,
      units: mat.units?.map((u) => ({ ...u })) || [],
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMaterial.set(null);
  }

  updateFormData(field: keyof MaterialFormData, value: any): void {
    this.formData.update((d) => ({ ...d, [field]: value }));
  }

  addUnit(): void {
    this.formData.update((d) => ({
      ...d,
      units: [
        ...d.units,
        {
          unit: 'PC',
          quantity: 1,
          isDefault: false,
          isPurchaseUnit: false,
          isSaleUnit: false,
          isActive: true,
        } as MaterialUnit,
      ],
    }));
  }

  removeUnit(index: number): void {
    this.formData.update((d) => ({
      ...d,
      units: d.units.filter((_, i) => i !== index),
    }));
  }

  updateUnit(index: number, field: keyof MaterialUnit, value: any): void {
    this.formData.update((d) => {
      const updated = [...d.units];
      updated[index] = { ...updated[index], [field]: value };
      return { ...d, units: updated };
    });
  }

  getUnitBadges(material: Material): string[] {
    return (
      material.units?.map((u) => {
        const label = STANDARD_UNITS.find((su) => su.value === u.unit)?.label || u.unit;
        const badges: string[] = [];
        if (u.isDefault) badges.push('Default');
        if (u.isPurchaseUnit) badges.push('Purchase');
        if (u.isSaleUnit) badges.push('Sale');
        return `${u.quantity} ${label}${badges.length ? ' (' + badges.join(', ') + ')' : ''}`;
      }) || []
    );
  }

  async saveMaterial(): Promise<void> {
    const data = this.formData();

    if (!data.name.trim()) {
      this.toast.error('Name is required');
      return;
    }

    if (data.units.length === 0) {
      this.toast.error('At least one unit is required');
      return;
    }

    const hasDefault = data.units.some((u) => u.isDefault);
    if (!hasDefault) {
      this.toast.error('At least one unit must be marked as Default');
      return;
    }

    const categoryValue = data.category === '__new__' ? data.newCategory : data.category;

    this.loading.set(true);

    const dto: CreateMaterialDto = {
      name: data.name.trim(),
      description: data.description || undefined,
      category: categoryValue || undefined,
      minStock: String(data.minStock || 0),
      isActive: data.isActive,
      units: data.units.map((u) => ({
        unit: u.unit,
        quantity: String(u.quantity),
        isDefault: u.isDefault,
        isPurchaseUnit: u.isPurchaseUnit,
        isSaleUnit: u.isSaleUnit,
      })),
    };

    const op =
      this.isEditing() && this.editingMaterial()
        ? this.materialsService.update(this.editingMaterial()!.id, dto as any)
        : this.materialsService.create(dto as any);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success(this.isEditing() ? 'Material updated' : 'Material created');
        this.loadMaterials();
        this.closeForm();
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toast.error('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteMaterial(id: number): void {
    this.confirmDialog.open({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        this.loading.set(true);
        this.materialsService.delete(id).subscribe({
          next: () => {
            this.loading.set(false);
            this.toast.success('Material deleted');
            this.loadMaterials();
          },
          error: (err: any) => {
            this.loading.set(false);
            this.toast.error('Error deleting: ' + err.message);
          },
        });
      },
    });
  }
}
