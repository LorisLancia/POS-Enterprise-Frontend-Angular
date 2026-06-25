import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  user$;
  sidebarOpen = true;

  menuItems = [
    { label: 'Dashboard', icon: '🏠', route: '/dashboard' },
    { label: 'Company', icon: '🏢', route: '/company' },
    { label: 'Warehouses', icon: '🏭', route: '/warehouses' },
    { label: 'POS Clients', icon: '🖥️', route: '/pos-clients' },
    { label: 'Products', icon: '📦', route: '/products' },
    { label: 'Materials', icon: '🏷️', route: '/materials' },
    { label: 'Categories', icon: '🏷️', route: '/categories' },
    { label: 'Units', icon: '🏷️', route: '/units' },
    { label: 'Unit Conversions', icon: '🏷️', route: '/unit-conversions' },
    { label: 'Users', icon: '👥', route: '/users' },
    { label: 'Sales Report', icon: '📊', route: '/sales-report' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.user$ = this.auth.user$;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
