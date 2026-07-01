import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModifierGroupsService } from '../../core/services/modifier-groups.service';
import { MaterialsService } from '../../core/services/materials.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
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

  showInactive = signal<boolean>(false);
  searchTerm = signal<string>('');

  editingGroup = signal<ModifierGroup | null>(null);
  showForm = signal(false);

  formData = signal<{
    name: string;
    selectionType: string;
    minSelect: number;
    maxSelect: number;
    options: {
      name: string;
      priceAdjustment: number;
      materialId: number;
      quantityConsumed: number;
      unit: string;
    }[];
  }>({
    name: '',
    selectionType: 'single',
    minSelect: 0,
    maxSelect: 1,
    options: [],
  });

  readonly filteredGroups = computed(() => {
    let list = this.groups();
    if (!this.showInactive()) {
      list = list.filter((g) => g.isActive);
    }
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter((g) => g.name.toLowerCase().includes(term));
    }
    return list;
  });

  hasGroups = computed(() => this.filteredGroups().length > 0);
  isEditing = computed(() => this.editingGroup() !== null);
  standardUnits = STANDARD_UNITS;

  constructor(
    private groupsService: ModifierGroupsService,
    private materialsService: MaterialsService,
    private confirmDialog: ConfirmDialogService,
    private toast: ToastService,
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
        this.loading.set(false);
        this.toast.error('Error loading groups: ' + err.message);
      },
    });
  }

  loadMaterials(): void {
    this.materialsService.getAll().subscribe({
      next: (data) => this.materials.set(data),
      error: () => {},
    });
  }

  refresh(): void {
    this.loadGroups();
  }

  openCreateForm(): void {
    this.editingGroup.set(null);
    this.formData.set({
      name: '',
      selectionType: 'single',
      minSelect: 0,
      maxSelect: 1,
      options: [],
    });
    this.showForm.set(true);
  }

  openEditForm(group: ModifierGroup): void {
    this.editingGroup.set(group);
    this.formData.set({
      name: group.name,
      selectionType: group.selectionType,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      options:
        group.options?.map((o) => ({
          name: o.name,
          priceAdjustment: o.priceAdjustment,
          materialId: o.materialId || 0,
          quantityConsumed: o.quantityConsumed || 0,
          unit: o.unit || 'ML',
        })) || [],
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingGroup.set(null);
  }

  updateFormData(field: string, value: any): void {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  addOption(): void {
    this.formData.update((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { name: '', priceAdjustment: 0, materialId: 0, quantityConsumed: 0, unit: 'ML' },
      ],
    }));
  }

  removeOption(index: number): void {
    this.formData.update((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }

  updateOption(
    index: number,
    field: 'name' | 'priceAdjustment' | 'materialId' | 'quantityConsumed' | 'unit',
    value: any,
  ): void {
    this.formData.update((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], [field]: value };
      return { ...prev, options };
    });
  }

  saveGroup(): void {
    const data = this.formData();
    if (!data.name.trim()) {
      this.toast.error('Name is required');
      return;
    }

    this.loading.set(true);
    const payload = {
      name: data.name,
      selectionType: data.selectionType,
      minSelect: Number(data.minSelect) || 0,
      maxSelect: Number(data.maxSelect) || 1,
      options: data.options
        .filter((o) => o.name.trim())
        .map((o) => ({
          name: o.name,
          priceAdjustment: Number(o.priceAdjustment) || 0,
          materialId: o.materialId > 0 ? o.materialId : undefined,
          quantityConsumed: Number(o.quantityConsumed) || undefined,
          unit: o.unit,
        })),
    };

    if (this.isEditing() && this.editingGroup()?.id) {
      this.groupsService.update(this.editingGroup()!.id!, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Modifier group updated');
          this.loadGroups();
          this.closeForm();
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error('Error updating: ' + err.message);
        },
      });
    } else {
      this.groupsService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Modifier group created');
          this.loadGroups();
          this.closeForm();
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error('Error creating: ' + err.message);
        },
      });
    }
  }

  deleteGroup(id: number): void {
    this.confirmDialog.open({
      title: 'Delete Modifier Group',
      message: 'Are you sure you want to delete this modifier group?',
      confirmText: 'Delete',
      onConfirm: () => {
        this.loading.set(true);
        this.groupsService.delete(id).subscribe({
          next: () => {
            this.loading.set(false);
            this.toast.success('Modifier group deleted');
            this.loadGroups();
          },
          error: (err) => {
            this.loading.set(false);
            this.toast.error('Error deleting: ' + err.message);
          },
        });
      },
    });
  }
}
