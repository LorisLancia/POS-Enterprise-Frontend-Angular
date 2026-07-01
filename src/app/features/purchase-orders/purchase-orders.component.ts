import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PurchaseOrdersService } from '../../core/services/purchase-orders.service';
import { SuppliersService } from '../../core/services/suppliers.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { MaterialsService } from '../../core/services/materials.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import {
  PurchaseOrder,
  POItemRequest,
  ReceiveItemRequest,
} from '../../core/models/purchase-order.model';
import { Supplier } from '../../core/models/supplier.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { Material } from '../../core/models/material.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss'],
})
export class PurchaseOrdersComponent {
  private poService = inject(PurchaseOrdersService);
  private suppliersService = inject(SuppliersService);
  private warehouseService = inject(WarehouseService);
  private materialsService = inject(MaterialsService);
  private toastService = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  // Data signals
  purchaseOrders = signal<PurchaseOrder[]>([]);
  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);
  materials = signal<Material[]>([]);

  // Filter signals
  selectedWarehouseId = signal<number | null>(null);
  showInactive = signal(false);
  searchTerm = signal('');

  // UI state
  isLoading = signal(false);
  showForm = signal(false);
  showReceiveForm = signal(false);
  editingId = signal<number | null>(null);
  receivingPo = signal<PurchaseOrder | null>(null);

  // Form signals
  formData = signal<{
    warehouseId: number | null;
    supplierId: number | null;
    notes: string;
    items: POItemRequest[];
  }>({
    warehouseId: null,
    supplierId: null,
    notes: '',
    items: [],
  });

  newItem = signal<Partial<POItemRequest>>({
    materialId: undefined,
    unitId: undefined,
    quantity: undefined,
    unitPrice: undefined,
  });

  receiveItems = signal<ReceiveItemRequest[]>([]);

  filteredPOs = computed(() => {
    let list = this.purchaseOrders();
    if (!this.showInactive()) {
      list = list.filter((po) => po.status !== 'cancelled');
    }
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (po) =>
          po.supplier?.name.toLowerCase().includes(term) ||
          po.notes?.toLowerCase().includes(term) ||
          po.status.toLowerCase().includes(term),
      );
    }
    return list;
  });

  selectedMaterialUnits = computed(() => {
    const matId = this.newItem().materialId;
    if (!matId) return [];
    const mat = this.materials().find((m) => m.id === matId);
    return mat?.units || [];
  });

  formTotal = computed(() => {
    return this.formData().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  });

  constructor() {
    this.loadWarehouses();
    this.loadSuppliers();
    this.loadMaterials();
  }

  loadPOs() {
    const whId = this.selectedWarehouseId();
    if (!whId) return;
    this.isLoading.set(true);
    this.poService.getAll(whId).subscribe({
      next: (data) => {
        this.purchaseOrders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Errore nel caricamento ordini');
        this.isLoading.set(false);
      },
    });
  }

  loadSuppliers() {
    this.suppliersService.getAll(1).subscribe({
      next: (data) => this.suppliers.set(data),
      error: () => this.toastService.error('Errore caricamento fornitori'),
    });
  }

  loadWarehouses() {
    this.warehouseService.getAll(1).subscribe({
      next: (data) => this.warehouses.set(data),
      error: () => this.toastService.error('Errore caricamento magazzini'),
    });
  }

  loadMaterials() {
    this.materialsService.getAll().subscribe({
      next: (data: Material[]) => this.materials.set(data),
      error: () => this.toastService.error('Errore caricamento materiali'),
    });
  }

  onWarehouseChange() {
    this.loadPOs();
  }

  openCreate() {
    this.editingId.set(null);
    this.formData.set({
      warehouseId: this.selectedWarehouseId(),
      supplierId: null,
      notes: '',
      items: [],
    });
    this.newItem.set({
      materialId: undefined,
      unitId: undefined,
      quantity: undefined,
      unitPrice: undefined,
    });
    this.showForm.set(true);
  }

  addItem() {
    const item = this.newItem();
    if (!item.materialId || !item.unitId || !item.quantity || !item.unitPrice) {
      this.toastService.error(`Compila tutti i campi dell'articolo`);
      return;
    }
    this.formData.update((fd) => ({
      ...fd,
      items: [
        ...fd.items,
        {
          materialId: item.materialId!,
          unitId: item.unitId!,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        },
      ],
    }));
    this.newItem.set({
      materialId: undefined,
      unitId: undefined,
      quantity: undefined,
      unitPrice: undefined,
    });
  }

  removeFormItem(index: number) {
    this.formData.update((fd) => ({
      ...fd,
      items: fd.items.filter((_, i) => i !== index),
    }));
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
    const fd = this.formData();
    if (!fd.warehouseId || !fd.supplierId || fd.items.length === 0) {
      this.toastService.error('Compila tutti i campi obbligatori');
      return;
    }

    this.poService
      .create({
        warehouseId: fd.warehouseId,
        supplierId: fd.supplierId,
        createdBy: 1,
        notes: fd.notes,
        items: fd.items,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Ordine di acquisto creato');
          this.showForm.set(false);
          this.loadPOs();
        },
        error: (err: any) =>
          this.toastService.error(err.error?.message || 'Errore nella creazione'),
      });
  }

  openReceive(po: PurchaseOrder) {
    this.receivingPo.set(po);
    this.receiveItems.set(
      po.items.map((item) => ({
        poItemId: item.id,
        receivedQty: Number(item.quantity) - Number(item.receivedQty),
        unitCost: Number(item.unitPrice),
      })),
    );
    this.showReceiveForm.set(true);
  }

  saveReceive() {
    const po = this.receivingPo();
    if (!po) return;

    const items = this.receiveItems().filter((item) => item.receivedQty > 0);
    if (items.length === 0) {
      this.toastService.error('Nessuna quantità da ricevere');
      return;
    }

    this.poService
      .receive(po.id, {
        receivedBy: 1,
        items,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Ricezione completata');
          this.showReceiveForm.set(false);
          this.receivingPo.set(null);
          this.loadPOs();
        },
        error: (err: any) =>
          this.toastService.error(err.error?.message || 'Errore nella ricezione'),
      });
  }

  cancelPO(po: PurchaseOrder) {
    this.confirmDialog.open({
      title: 'Annulla ordine',
      message: `Annullare l'ordine #${po.id} da ${po.supplier?.name}?`,
      confirmText: 'Annulla ordine',
      cancelText: 'Chiudi',
      onConfirm: () => {
        this.poService.cancel(po.id).subscribe({
          next: () => {
            this.toastService.success('Ordine annullato');
            this.loadPOs();
          },
          error: () => this.toastService.error('Errore'),
        });
      },
    });
  }

  closeForm() {
    this.showForm.set(false);
    this.showReceiveForm.set(false);
    this.receivingPo.set(null);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'draft':
        return 'badge-draft';
      case 'sent':
        return 'badge-sent';
      case 'partial':
        return 'badge-partial';
      case 'received':
        return 'badge-received';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Bozza',
      sent: 'Inviato',
      partial: 'Parziale',
      received: 'Ricevuto',
      cancelled: 'Annullato',
    };
    return labels[status] || status;
  }
}
