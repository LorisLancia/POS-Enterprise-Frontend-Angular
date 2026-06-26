// src/app/features/materials/materials.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService } from '../../core/services/materials.service';
import { Material, MaterialUnit } from '../../core/models/material.model';

const STANDARD_UNITS: { value: MaterialUnit['unit']; label: string }[] = [
  { value: 'ML', label: 'Milliliter (ml)' },
  { value: 'L', label: 'Liter (l)' },
  { value: 'G', label: 'Gram (g)' },
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'PC', label: 'Piece (pc)' },
  { value: 'PK', label: 'Pack (pk)' },
];

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss',
})
export class MaterialsComponent implements OnInit {
  materials = signal<Material[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingMaterial = signal<Material | null>(null);

  // Form fields
  formName = signal('');
  formDescription = signal('');
  formCategory = signal('');
  formNewCategory = signal('');
  formMinStockLevel = signal(0);
  formIsActive = signal(true);

  // Unit management
  formUnits = signal<MaterialUnit[]>([]);

  existingCategories = computed(() => {
    const cats = this.materials()
      .map((m) => m.category)
      .filter((c): c is string => !!c && c !== '');
    return [...new Set(cats)];
  });

  showNewCategoryInput = computed(() => this.formCategory() === '__new__');
  hasMaterials = computed(() => this.materials().length > 0);
  isEditing = computed(() => this.editingMaterial() !== null);
  standardUnits = STANDARD_UNITS;

  constructor(private materialsService: MaterialsService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading.set(true);
    this.error.set('');
    this.materialsService.getAll().subscribe({
      next: (data) => {
        this.materials.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error: ' + (err.message || 'Unknown'));
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingMaterial.set(null);
    this.formName.set('');
    this.formDescription.set('');
    this.formCategory.set('');
    this.formNewCategory.set('');
    this.formMinStockLevel.set(0);
    this.formIsActive.set(true);
    this.formUnits.set([]);
    this.showForm.set(true);
  }

  openEditForm(mat: Material): void {
    this.editingMaterial.set(mat);
    this.formName.set(mat.name);
    this.formDescription.set(mat.description || '');
    this.formMinStockLevel.set(mat.minStockLevel || 0);
    this.formIsActive.set(mat.isActive);

    const existing = this.existingCategories();
    if (mat.category && existing.includes(mat.category)) {
      this.formCategory.set(mat.category);
      this.formNewCategory.set('');
    } else if (mat.category) {
      this.formCategory.set('__new__');
      this.formNewCategory.set(mat.category);
    } else {
      this.formCategory.set('');
      this.formNewCategory.set('');
    }

    // Carica le unità esistenti
    this.formUnits.set(mat.units?.map((u) => ({ ...u })) || []);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMaterial.set(null);
  }

  // Unit management
  addUnit(): void {
    this.formUnits.update((units) => [
      ...units,
      {
        unit: 'PC',
        quantity: 1,
        isDefault: false,
        isPurchaseUnit: false,
        isSaleUnit: false,
        isActive: true,
      },
    ]);
  }

  removeUnit(index: number): void {
    this.formUnits.update((units) => units.filter((_, i) => i !== index));
  }

  updateUnit(index: number, field: keyof MaterialUnit, value: any): void {
    this.formUnits.update((units) => {
      const updated = [...units];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  getDefaultUnitName(material: Material): string {
    const defaultUnit = material.units?.find((u) => u.isDefault);
    if (defaultUnit) {
      const unitLabel =
        STANDARD_UNITS.find((u) => u.value === defaultUnit.unit)?.label || defaultUnit.unit;
      return `${defaultUnit.quantity} ${unitLabel}`;
    }
    return '-';
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

  saveMaterial(): void {
    if (!this.formName()) {
      this.error.set('Name is required');
      return;
    }

    if (this.formUnits().length === 0) {
      this.error.set('At least one unit is required');
      return;
    }

    // Verifica che ci sia almeno una unità default
    const hasDefault = this.formUnits().some((u) => u.isDefault);
    if (!hasDefault) {
      this.error.set('At least one unit must be marked as Default');
      return;
    }

    const categoryValue =
      this.formCategory() === '__new__' ? this.formNewCategory() : this.formCategory();

    this.loading.set(true);
    const dto = {
      name: this.formName(),
      description: this.formDescription(),
      category: categoryValue || '',
      minStock: this.formMinStockLevel() || 0,
      isActive: this.formIsActive(),
      units: this.formUnits().map((u) => ({
        unit: u.unit,
        quantity: u.quantity,
        isDefault: u.isDefault,
        isPurchaseUnit: u.isPurchaseUnit,
        isSaleUnit: u.isSaleUnit,
      })),
    };

    const op =
      this.isEditing() && this.editingMaterial()
        ? this.materialsService.update(this.editingMaterial()!.id, dto)
        : this.materialsService.create(dto);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.loadMaterials();
        this.closeForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error: ' + (err.message || 'Unknown'));
      },
    });
  }

  deleteMaterial(id: number): void {
    if (!confirm('Delete this material?')) return;
    this.loading.set(true);
    this.materialsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadMaterials();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }
}
