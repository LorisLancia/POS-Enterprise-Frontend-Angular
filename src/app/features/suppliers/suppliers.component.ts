import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SuppliersService } from '../../core/services/suppliers.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Supplier, CreateSupplierRequest } from '../../core/models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
})
export class SuppliersComponent {
  private suppliersService = inject(SuppliersService);
  private toastService = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  suppliers = signal<Supplier[]>([]);
  showInactive = signal(false);
  searchTerm = signal('');
  isLoading = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  formData = signal<CreateSupplierRequest>({
    companyId: 1,
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
  });

  filteredSuppliers = computed(() => {
    let list = this.suppliers();
    if (!this.showInactive()) {
      list = list.filter((s) => s.isActive);
    }
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.contact?.toLowerCase().includes(term) ?? false) ||
          (s.phone?.toLowerCase().includes(term) ?? false) ||
          (s.email?.toLowerCase().includes(term) ?? false),
      );
    }
    return list;
  });

  constructor() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isLoading.set(true);
    this.suppliersService.getAll(1).subscribe({
      next: (data) => {
        this.suppliers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Errore nel caricamento fornitori');
        this.isLoading.set(false);
      },
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.formData.set({
      companyId: 1,
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
    });
    this.showForm.set(true);
  }

  openEdit(supplier: Supplier) {
    this.editingId.set(supplier.id);
    this.formData.set({
      companyId: supplier.companyId,
      name: supplier.name,
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    this.showForm.set(true);
  }

  save() {
    const data = this.formData();
    if (!data.name.trim()) {
      this.toastService.error('Il nome è obbligatorio');
      return;
    }

    const req = this.editingId()
      ? this.suppliersService.update(this.editingId()!, data)
      : this.suppliersService.create(data);

    req.subscribe({
      next: () => {
        this.toastService.success(this.editingId() ? 'Fornitore aggiornato' : 'Fornitore creato');
        this.showForm.set(false);
        this.loadSuppliers();
      },
      error: () => this.toastService.error('Errore nel salvataggio'),
    });
  }

  toggleStatus(supplier: Supplier) {
    const action = supplier.isActive ? 'disattivare' : 'riattivare';
    this.confirmDialog.open({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} fornitore`,
      message: `Sei sicuro di voler ${action} ${supplier.name}?`,
      confirmText: 'Conferma',
      cancelText: 'Annulla',
      onConfirm: () => {
        this.suppliersService.update(supplier.id, { isActive: !supplier.isActive }).subscribe({
          next: () => {
            this.toastService.success(
              `Fornitore ${supplier.isActive ? 'disattivato' : 'riattivato'}`,
            );
            this.loadSuppliers();
          },
          error: () => this.toastService.error('Errore'),
        });
      },
    });
  }

  deleteSupplier(supplier: Supplier) {
    this.confirmDialog.open({
      title: 'Elimina fornitore',
      message: `Eliminare ${supplier.name}? Questa azione è irreversibile.`,
      confirmText: 'Elimina',
      cancelText: 'Annulla',
      onConfirm: () => {
        this.suppliersService.delete(supplier.id).subscribe({
          next: () => {
            this.toastService.success('Fornitore eliminato');
            this.loadSuppliers();
          },
          error: () => this.toastService.error("Errore nell'eliminazione"),
        });
      },
    });
  }

  closeForm() {
    this.showForm.set(false);
  }
}
