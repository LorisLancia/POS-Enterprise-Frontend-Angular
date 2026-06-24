// src/app/features/materials/materials.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsService } from '../../core/services/materials.service';
import { Material } from '../../core/models/material.model';

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

  formName = signal('');
  formUnit = signal('piece');
  formCostPerUnit = signal(0);
  formMinStockLevel = signal(0);
  formCategory = signal('');
  formDescription = signal('');
  formIsActive = signal(true);

  hasMaterials = computed(() => this.materials().length > 0);
  isEditing = computed(() => this.editingMaterial() !== null);

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
    this.formUnit.set('piece');
    this.formCostPerUnit.set(0);
    this.formMinStockLevel.set(0);
    this.formCategory.set('');
    this.formDescription.set('');
    this.formIsActive.set(true);
    this.showForm.set(true);
  }

  openEditForm(mat: Material): void {
    this.editingMaterial.set(mat);
    this.formName.set(mat.name);
    this.formUnit.set(mat.unit);
    this.formCostPerUnit.set(mat.costPerUnit);
    this.formMinStockLevel.set(mat.minStockLevel);
    this.formCategory.set(mat.category);
    this.formDescription.set(mat.description);
    this.formIsActive.set(mat.isActive);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMaterial.set(null);
  }

  saveMaterial(): void {
    if (!this.formName()) {
      this.error.set('Name is required');
      return;
    }

    this.loading.set(true);
    const dto = {
      name: this.formName(),
      unit: this.formUnit(),
      costPerUnit: Number(this.formCostPerUnit()) || 0,
      minStockLevel: Number(this.formMinStockLevel()) || 0,
      category: this.formCategory() || '',
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
}
