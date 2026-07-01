import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { MaterialsService } from '../../../core/services/materials.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ToastService } from '../../../core/services/toast.service';
import { Material } from '../../../core/models/material.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { StartingBalanceItemRequest } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-starting-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './starting-balance.component.html',
  styleUrls: ['./starting-balance.component.scss'],
})
export class StartingBalanceComponent {
  private inventoryService = inject(InventoryService);
  private materialsService = inject(MaterialsService);
  private warehouseService = inject(WarehouseService);
  private toastService = inject(ToastService);

  materials = signal<Material[]>([]);
  warehouses = signal<Warehouse[]>([]);
  selectedWarehouseId = signal<number | null>(null);
  balanceItems = signal<StartingBalanceItemRequest[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  newItem = signal<Partial<StartingBalanceItemRequest>>({
    materialId: undefined,
    unitId: undefined,
    quantity: undefined,
    unitCost: undefined,
    notes: '',
  });

  selectedMaterialUnits = computed(() => {
    const matId = this.newItem().materialId;
    if (!matId) return [];
    const mat = this.materials().find((m) => m.id === matId);
    return mat?.units || [];
  });

  totalValue = computed(() => {
    return this.balanceItems().reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  });

  constructor() {
    this.loadMaterials();
    this.loadWarehouses();
  }

  loadMaterials() {
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => this.materials.set(data),
      error: () => this.toastService.error('Errore caricamento materiali'),
    });
  }

  loadWarehouses() {
    this.warehouseService.getAll(1).subscribe({
      next: (data: Warehouse[]) => this.warehouses.set(data),
      error: () => this.toastService.error('Errore caricamento magazzini'),
    });
  }

  addItem() {
    const item = this.newItem();
    if (!item.materialId || !item.unitId || !item.quantity || !item.unitCost) {
      this.toastService.error('Compila tutti i campi obbligatori');
      return;
    }

    this.balanceItems.update((items) => [
      ...items,
      {
        materialId: item.materialId!,
        unitId: item.unitId!,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        notes: item.notes || '',
      },
    ]);

    this.newItem.set({
      materialId: undefined,
      unitId: undefined,
      quantity: undefined,
      unitCost: undefined,
      notes: '',
    });
  }

  removeItem(index: number) {
    this.balanceItems.update((items) => items.filter((_, i) => i !== index));
  }

  getMaterialName(materialId: number): string {
    return this.materials().find((m) => m.id === materialId)?.name || 'N/A';
  }

  getUnitLabel(unitId: number): string {
    for (const mat of this.materials()) {
      const unit = mat.units?.find((u) => u.id === unitId);
      if (unit) return unit.unit;
    }
    return 'N/A';
  }

  save() {
    const warehouseId = this.selectedWarehouseId();
    if (!warehouseId) {
      this.toastService.error('Seleziona un magazzino');
      return;
    }
    if (this.balanceItems().length === 0) {
      this.toastService.error('Aggiungi almeno un articolo');
      return;
    }

    this.isSaving.set(true);
    this.inventoryService
      .createStartingBalance({
        warehouseId,
        createdBy: 1,
        items: this.balanceItems(),
      })
      .subscribe({
        next: () => {
          this.toastService.success('Giacenza iniziale salvata con successo');
          this.balanceItems.set([]);
          this.selectedWarehouseId.set(null);
          this.isSaving.set(false);
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Errore nel salvataggio');
          this.isSaving.set(false);
        },
      });
  }
}
