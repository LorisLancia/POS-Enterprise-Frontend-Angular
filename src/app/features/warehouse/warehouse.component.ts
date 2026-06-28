import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WarehouseService } from '../../core/services/warehouse.service';
import { CompanyService } from '../../core/services/company.service';
import { Warehouse, CreateWarehouseRequest } from '../../core/models/warehouse.model';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-warehouse-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss'],
})
export class WarehousePageComponent implements OnInit {
  companies = signal<Company[]>([]);
  warehouses = signal<Warehouse[]>([]);
  selectedCompanyId = signal<number>(0);
  showInactive = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  formData = signal<Partial<CreateWarehouseRequest>>({});

  constructor(
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  ngOnInit() {
    this.companyService.getAll().subscribe((data) => this.companies.set(data));
  }

  updateForm(field: keyof CreateWarehouseRequest, value: any) {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  onCompanyChange() {
    const id = this.selectedCompanyId();
    if (id > 0) {
      this.warehouseService.getAll(id).subscribe((data) => this.warehouses.set(data));
      console.log(this.warehouses);
    } else {
      this.warehouses.set([]);
    }
    this.cancel();
  }

  filteredWarehouses = computed(() => {
    const all = this.warehouses();
    if (this.showInactive()) return all;
    return all.filter((w) => w.isActive);
  });

  startCreate() {
    this.editingId.set(null);
    this.formData.set({
      companyId: Number(this.selectedCompanyId()),
      name: '',
      address: '',
      phone: '',
    });
    this.isEditing.set(true);
  }

  startEdit(w: Warehouse) {
    this.editingId.set(w.id);
    this.formData.set({
      companyId: w.companyId, // <-- AGGIUNGI QUESTO
      name: w.name,
      address: w.address,
      phone: w.phone,
    });
    this.isEditing.set(true);
  }

  cancel() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData.set({});
  }

  save() {
    const raw = this.formData() as CreateWarehouseRequest;
    const data: CreateWarehouseRequest = {
      ...raw,
      companyId: Number(raw.companyId),
      name: raw.name || '',
    };

    // In update non serve validare companyId (già presente)
    // In create invece sì
    if (!this.editingId() && (!data.companyId || data.companyId <= 0)) {
      alert('Please select a company');
      return;
    }

    if (this.editingId()) {
      this.warehouseService.update(this.editingId()!, data).subscribe(() => {
        this.onCompanyChange();
        this.cancel();
      });
    } else {
      this.warehouseService.create(data).subscribe(() => {
        this.onCompanyChange();
        this.cancel();
      });
    }
  }

  remove(id: number) {
    if (confirm('Delete this warehouse?')) {
      this.warehouseService.delete(id).subscribe(() => this.onCompanyChange());
    }
  }
}
