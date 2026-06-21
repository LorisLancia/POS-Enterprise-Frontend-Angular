import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats = { products: 0, materials: 0, sales: 0, shifts: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<any[]>('http://localhost:3000/products')
      .subscribe((res) => (this.stats.products = res.length));
    this.http
      .get<any[]>('http://localhost:3000/materials')
      .subscribe((res) => (this.stats.materials = res.length));
    this.http
      .get<any[]>('http://localhost:3000/sales')
      .subscribe((res) => (this.stats.sales = res.length));
    this.http
      .get<any[]>('http://localhost:3000/sales/shifts')
      .subscribe((res) => (this.stats.shifts = res.length));
  }
}
