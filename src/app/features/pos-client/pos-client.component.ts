import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PosClientService } from '../../core/services/pos-client.service';
import { CompanyService } from '../../core/services/company.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { POSClient, CreatePOSClientRequest } from '../../core/models/pos-client.model';
import { Company } from '../../core/models/company.model';
import { Warehouse } from '../../core/models/warehouse.model';

@Component({
  selector: 'app-pos-client-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pos-client.component.html',
  styleUrls: ['./pos-client.component.scss'],
})
export class PosClientPageComponent implements OnInit {
  companies = signal<Company[]>([]);
  warehouses = signal<Warehouse[]>([]);
  posClients = signal<POSClient[]>([]);
  selectedCompanyId = signal<number>(0);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  formData = signal<Partial<CreatePOSClientRequest>>({});

  constructor(
    private posClientService: PosClientService,
    private companyService: CompanyService,
    private warehouseService: WarehouseService,
  ) {}

  ngOnInit() {
    this.companyService.getAll().subscribe((data) => this.companies.set(data));
  }

  onCompanyChange() {
    const id = this.selectedCompanyId();
    if (id > 0) {
      this.warehouseService.getAll(id).subscribe((data) => this.warehouses.set(data));
      this.posClientService.getAll(id).subscribe((data) => this.posClients.set(data));
    } else {
      this.warehouses.set([]);
      this.posClients.set([]);
    }
    this.cancel();
  }

  startCreate() {
    this.editingId.set(null);
    this.formData.set({
      companyId: Number(this.selectedCompanyId()),
      warehouseId: 0,
    });
    this.isEditing.set(true);
  }

  startEdit(pos: POSClient) {
    this.editingId.set(pos.id);
    // Only DTO fields, exclude relations and extra fields
    this.formData.set({
      warehouseId: pos.warehouseId,
      name: pos.name,
      location: pos.location,
      hardwareId: pos.hardwareId,
    });
    this.isEditing.set(true);
  }

  cancel() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData.set({});
  }

  save() {
    const raw = this.formData() as CreatePOSClientRequest;
    const data: CreatePOSClientRequest = {
      ...raw,
      companyId: Number(raw.companyId),
      warehouseId: Number(raw.warehouseId),
      name: raw.name || '',
      hardwareId: raw.hardwareId || '',
    };
    if (!data.warehouseId || data.warehouseId <= 0) {
      alert('Please select a warehouse');
      return;
    }
    if (this.editingId()) {
      this.posClientService.update(this.editingId()!, data).subscribe(() => {
        this.onCompanyChange();
        this.cancel();
      });
    } else {
      this.posClientService.create(data).subscribe(() => {
        this.onCompanyChange();
        this.cancel();
      });
    }
  }

  syncNow(id: number) {
    this.posClientService.registerSync(id).subscribe(() => {
      alert('Sync registered successfully');
      this.onCompanyChange();
    });
  }

  remove(id: number) {
    if (confirm('Delete this register? Historical sales data will remain in the database.')) {
      this.posClientService.delete(id).subscribe(() => this.onCompanyChange());
    }
  }
}
