// src/app/features/materials/materials.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService } from '../../core/services/materials.service';
import { UnitsService } from '../../core/services/units.service';
import { Material } from '../../core/models/material.model';
import { Unit } from '../../core/models/unit.model';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss',
})
export class MaterialsComponent implements OnInit {
  materials = signal<Material[]>([]);
  units = signal<Unit[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingMaterial = signal<Material | null>(null);

  formName = signal('');
  formUnitId = signal(0); // ← CHANGED: era formUnit string
  formCostPerUnit = signal(0);
  formMinStockLevel = signal(0);
  formCategory = signal('');
  formNewCategory = signal('');
  formDescription = signal('');
  formIsActive = signal(true);

  existingCategories = computed(() => {
    const cats = this.materials()
      .map((m) => m.category)
      .filter((c): c is string => !!c && c !== '');
    return [...new Set(cats)];
  });

  showNewCategoryInput = computed(() => this.formCategory() === '__new__');
  hasMaterials = computed(() => this.materials().length > 0);
  isEditing = computed(() => this.editingMaterial() !== null);

  constructor(
    private materialsService: MaterialsService,
    private unitsService: UnitsService,
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
    this.loadUnits();
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

  loadUnits(): void {
    this.unitsService.getAll().subscribe({
      next: (data: Unit[]) => this.units.set(data),
      error: () => {},
    });
  }

  openCreateForm(): void {
    this.editingMaterial.set(null);
    this.formName.set('');
    this.formUnitId.set(0); // ← CHANGED
    this.formCostPerUnit.set(0);
    this.formMinStockLevel.set(0);
    this.formCategory.set('');
    this.formNewCategory.set('');
    this.formDescription.set('');
    this.formIsActive.set(true);
    this.showForm.set(true);
  }

  openEditForm(mat: Material): void {
    this.editingMaterial.set(mat);
    this.formName.set(mat.name);
    this.formUnitId.set(mat.unitId); // ← CHANGED: era mat.unit
    this.formCostPerUnit.set(mat.costPerUnit);
    this.formMinStockLevel.set(mat.minStockLevel);

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

    this.formDescription.set(mat.description);
    this.formIsActive.set(mat.isActive);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMaterial.set(null);
  }

  saveMaterial(): void {
    if (!this.formName() || !this.formUnitId()) {
      this.error.set('Name and Unit are required');
      return;
    }

    const categoryValue =
      this.formCategory() === '__new__' ? this.formNewCategory() : this.formCategory();

    this.loading.set(true);
    const dto = {
      name: this.formName(),
      unitId: Number(this.formUnitId()), // ← CHANGED: era unit
      costPerUnit: Number(this.formCostPerUnit()) || 0,
      minStockLevel: Number(this.formMinStockLevel()) || 0,
      category: categoryValue || '',
      description: this.formDescription(),
      isActive: this.formIsActive(),
      supplierId: null,
    };

    const op =
      this.isEditing() && this.editingMaterial()
        ? this.materialsService.update(this.editingMaterial()!.id, dto)
        : this.materialsService.create(dto as Omit<Material, 'id' | 'createdAt' | 'updatedAt'>);

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

  getUnitName(unitId: number): string {
    return this.units().find((u) => u.id === unitId)?.symbol || '-';
  }
}
