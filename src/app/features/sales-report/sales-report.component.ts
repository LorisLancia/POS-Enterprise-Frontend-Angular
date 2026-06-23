import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService, SalesReport, Sale } from '../../core/services/sales.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss',
})
export class SalesReportComponent implements OnInit {
  report = signal<SalesReport | null>(null);
  loading = signal(false);
  error = signal('');

  fromDate = signal('');
  toDate = signal('');

  expandedSaleId = signal<number | null>(null);

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    this.fromDate.set(thirtyDaysAgo);
    this.toDate.set(today);
    this.loadReport();
  }

  loadReport(): void {
    if (!this.fromDate() || !this.toDate()) {
      this.error.set('Please select both dates');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.salesService.getReport(this.fromDate(), this.toDate()).subscribe({
      next: (data: SalesReport) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error loading report: ' + (err.message || 'Unknown error'));
        this.loading.set(false);
      },
    });
  }

  toggleExpand(saleId: number): void {
    this.expandedSaleId.set(this.expandedSaleId() === saleId ? null : saleId);
  }

  isExpanded(saleId: number): boolean {
    return this.expandedSaleId() === saleId;
  }
}
