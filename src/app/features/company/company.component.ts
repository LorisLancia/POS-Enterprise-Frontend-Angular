import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { Company, CreateCompanyRequest } from '../../core/models/company.model';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
})
export class CompanyPageComponent implements OnInit {
  companies = signal<Company[]>([]);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  formData = signal<Partial<CreateCompanyRequest>>({});

  constructor(private service: CompanyService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe((data) => this.companies.set(data));
  }

  startCreate() {
    this.editingId.set(null);
    this.formData.set({ timezone: 'Asia/Bangkok', currency: 'THB', country: 'TH' });
    this.isEditing.set(true);
  }

  startEdit(company: Company) {
    this.editingId.set(company.id);
    this.formData.set({
      name: company.name,
      legalName: company.legalName,
      taxId: company.taxId,
      vatNumber: company.vatNumber,
      address: company.address,
      postalCode: company.postalCode,
      city: company.city,
      province: company.province,
      country: company.country,
      phone: company.phone,
      email: company.email,
      timezone: company.timezone,
      currency: company.currency,
      logoUrl: company.logoUrl,
    });
    this.isEditing.set(true);
  }

  cancel() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData.set({});
  }

  save() {
    const raw = this.formData() as CreateCompanyRequest;
    const data: CreateCompanyRequest = {
      ...raw,
      name: raw.name || '',
    };
    if (this.editingId()) {
      this.service.update(this.editingId()!, data).subscribe(() => {
        this.load();
        this.cancel();
      });
    } else {
      this.service.create(data).subscribe(() => {
        this.load();
        this.cancel();
      });
    }
  }

  remove(id: number) {
    if (
      confirm(
        'Delete this company? All associated data (warehouses, POS, products) will remain in the database but the company will be deactivated.',
      )
    ) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
