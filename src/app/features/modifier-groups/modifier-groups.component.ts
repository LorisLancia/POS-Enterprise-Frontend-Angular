import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModifierGroupsService } from '../../core/services/modifier-groups.service';
import { MaterialsService } from '../../core/services/materials.service';
import { ModifierGroup, STANDARD_UNITS } from '../../core/models/product.model';
import { Material } from '../../core/models/material.model';

@Component({
  selector: 'app-modifier-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifier-groups.component.html',
  styleUrl: './modifier-groups.component.scss',
})
export class ModifierGroupsComponent implements OnInit {
  groups = signal<ModifierGroup[]>([]);
  materials = signal<Material[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);

  formData = {
    name: '',
    selectionType: 'single',
    minSelect: 0,
    maxSelect: 1,
    options: [] as {
      name: string;
      priceAdjustment: number;
      materialId: number;
      quantityConsumed: number;
      unit: string;
    }[],
  };

  standardUnits = STANDARD_UNITS;

  constructor(
    private groupsService: ModifierGroupsService,
    private materialsService: MaterialsService,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadMaterials();
  }

  loadGroups(): void {
    this.loading.set(true);
    this.groupsService.getAll().subscribe({
      next: (data) => {
        this.groups.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error loading groups: ' + err.message);
        this.loading.set(false);
      },
    });
  }

  loadMaterials(): void {
    this.materialsService.getAll().subscribe({
      next: (data) => this.materials.set(data),
      error: () => {},
    });
  }

  openForm(): void {
    this.formData = {
      name: '',
      selectionType: 'single',
      minSelect: 0,
      maxSelect: 1,
      options: [],
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  addOption(): void {
    this.formData.options.push({
      name: '',
      priceAdjustment: 0,
      materialId: 0,
      quantityConsumed: 0,
      unit: 'ML',
    });
  }

  removeOption(index: number): void {
    this.formData.options.splice(index, 1);
  }

  saveGroup(): void {
    if (!this.formData.name.trim()) {
      this.error.set('Name is required');
      return;
    }

    this.loading.set(true);
    const payload = {
      name: this.formData.name,
      selectionType: this.formData.selectionType,
      minSelect: Number(this.formData.minSelect) || 0,
      maxSelect: Number(this.formData.maxSelect) || 1,
      options: this.formData.options
        .filter((o) => o.name.trim())
        .map((o) => ({
          name: o.name,
          priceAdjustment: Number(o.priceAdjustment) || 0,
          materialId: o.materialId > 0 ? o.materialId : undefined,
          quantityConsumed: Number(o.quantityConsumed) || undefined,
          unit: o.unit,
        })),
    };

    this.groupsService.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadGroups();
        this.closeForm();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error creating: ' + err.message);
      },
    });
  }

  deleteGroup(id: number): void {
    if (!confirm('Delete this modifier group?')) return;
    this.loading.set(true);
    this.groupsService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadGroups();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error deleting: ' + err.message);
      },
    });
  }
}
