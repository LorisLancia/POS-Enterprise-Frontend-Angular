import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { MaterialsService } from '../../../core/services/materials.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ToastService } from '../../../core/services/toast.service';
import { PurchaseOrder, POItem, POItemRequest } from '../../../core/models/purchase-order.model';
import { Supplier } from '../../../core/models/supplier.model';
import { Material } from '../../../core/models/material.model';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss'],
})
export class PurchaseOrdersComponent {
  private poService = inject(PurchaseOrdersService);
  private suppliersService = inject(SuppliersService);
  private materialsService = inject(MaterialsService);
  private warehouseService = inject(WarehouseService);
  private toastService = inject(ToastService);

  orders = signal<PurchaseOrder[]>([]);
  suppliers = signal<Supplier[]>([]);
  materials = signal<Material[]>([]);
  warehouses = signal<Warehouse[]>([]);
  isLoading = signal(false);
  showForm = signal(false);
  isSaving = signal(false);

  selectedWarehouseId = signal<number | null>(null);
  selectedSupplierId = signal<number | null>(null);
  poItems = signal<POItemRequest[]>([]);

  newItemMaterialId = signal<number | undefined>(undefined);
  newItemUnitId = signal<number | undefined>(undefined);
  newItemQuantity = signal<number | undefined>(undefined);
  newItemUnitPrice = signal<number | undefined>(undefined);

  selectedMaterialUnits = computed(() => {
    const matId = this.newItemMaterialId();
    if (!matId) return [];
    const mat = this.materials().find((m) => m.id === matId);
    return mat?.units || [];
  });

  totalValue = computed(() => {
    return this.poItems().reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  });

  constructor() {
    this.loadOrders();
    this.loadSuppliers();
    this.loadMaterials();
    this.loadWarehouses();
  }

  loadOrders() {
    this.isLoading.set(true);
    const whId = this.selectedWarehouseId();
    this.poService.getAll(whId || 0).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error loading purchase orders');
        this.isLoading.set(false);
      },
    });
  }

  loadSuppliers() {
    this.suppliersService.getAll(1).subscribe({
      next: (data) => this.suppliers.set(data),
      error: () => this.toastService.error('Error loading suppliers'),
    });
  }

  loadMaterials() {
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => this.materials.set(data.filter((m) => m.isActive)),
      error: () => this.toastService.error('Error loading materials'),
    });
  }

  loadWarehouses() {
    this.warehouseService.getAll(1).subscribe({
      next: (data) => this.warehouses.set(data),
      error: () => this.toastService.error('Error loading warehouses'),
    });
  }

  openCreate() {
    this.selectedSupplierId.set(null);
    this.poItems.set([]);
    this.resetNewItem();
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.selectedSupplierId.set(null);
    this.poItems.set([]);
    this.resetNewItem();
  }

  resetNewItem() {
    this.newItemMaterialId.set(undefined);
    this.newItemUnitId.set(undefined);
    this.newItemQuantity.set(undefined);
    this.newItemUnitPrice.set(undefined);
  }

  addItem() {
    const materialId = this.newItemMaterialId();
    const unitId = this.newItemUnitId();
    const quantity = this.newItemQuantity();
    const unitPrice = this.newItemUnitPrice();

    if (!materialId || !unitId || !quantity || !unitPrice) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.poItems.update((items) => [
      ...items,
      {
        materialId,
        unitId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      },
    ]);

    this.resetNewItem();
  }

  removeItem(index: number) {
    this.poItems.update((items) => items.filter((_, i) => i !== index));
  }

  getMaterialName(materialId?: number): string {
    return this.materials().find((m) => m.id === materialId)?.name || 'N/A';
  }

  getUnitLabel(unitId?: number): string {
    for (const mat of this.materials()) {
      const unit = mat.units?.find((u) => u.id === unitId);
      if (unit) return unit.unit;
    }
    return 'N/A';
  }

  getSupplierName(supplierId?: number): string {
    return this.suppliers().find((s) => s.id === supplierId)?.name || 'N/A';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      partial: 'Partial',
      received: 'Received',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  save() {
    const warehouseId = this.selectedWarehouseId();
    const supplierId = this.selectedSupplierId();

    if (!warehouseId || !supplierId) {
      this.toastService.error('Please select warehouse and supplier');
      return;
    }
    if (this.poItems().length === 0) {
      this.toastService.error('Please add at least one item');
      return;
    }

    this.isSaving.set(true);
    this.poService
      .create({
        warehouseId,
        supplierId,
        createdBy: 1,
        items: this.poItems(),
      })
      .subscribe({
        next: () => {
          this.toastService.success('Purchase order created successfully');
          this.loadOrders();
          this.closeForm();
          this.isSaving.set(false);
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Error creating purchase order');
          this.isSaving.set(false);
        },
      });
  }

  receiveOrder(order: PurchaseOrder) {
    if (!confirm(`Receive order #${order.id}? This will update inventory.`)) return;
    this.poService
      .receive(order.id!, {
        receivedBy: 1,
        items: order.items.map((item) => ({
          poItemId: item.id,
          receivedQty: item.quantity - item.receivedQty,
          unitCost: item.unitPrice,
        })),
      })
      .subscribe({
        next: () => {
          this.toastService.success('Order received successfully');
          this.loadOrders();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Error receiving order');
        },
      });
  }

  cancelOrder(order: PurchaseOrder) {
    if (!confirm(`Cancel order #${order.id}?`)) return;
    this.poService.cancel(order.id!).subscribe({
      next: () => {
        this.toastService.success('Order cancelled successfully');
        this.loadOrders();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Error cancelling order');
      },
    });
  }
}
