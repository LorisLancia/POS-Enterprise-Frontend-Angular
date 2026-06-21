import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Products</h1>
    <p>Product management coming soon...</p>`,
})
export class ProductsComponent {}
