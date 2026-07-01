import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission: string;
}

interface MenuGroup {
  label: string;
  icon: string;
  permission: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent, ConfirmDialogComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  user$;
  sidebarOpen = signal(true);

  // Stato espanso/collassato dei gruppi (persiste durante la sessione)
  expandedGroups = signal<Record<string, boolean>>({
    setup: false,
    catalog: false,
    inventory: false,
    sales: false,
    admin: false,
  });

  private readonly allGroups: MenuGroup[] = [
    {
      label: 'Setup',
      icon: 'fa-gear',
      permission: 'company:read',
      items: [
        { label: 'Company', icon: 'fa-building', route: '/company', permission: 'company:read' },
        {
          label: 'Warehouses',
          icon: 'fa-warehouse',
          route: '/warehouses',
          permission: 'warehouse:read',
        },
        {
          label: 'POS Clients',
          icon: 'fa-desktop',
          route: '/pos-clients',
          permission: 'pos-client:read',
        },
      ],
    },
    {
      label: 'Catalog',
      icon: 'fa-tags',
      permission: 'product:read',
      items: [
        {
          label: 'Categories',
          icon: 'fa-folder-tree',
          route: '/categories',
          permission: 'product:read',
        },
        { label: 'Products', icon: 'fa-box-open', route: '/products', permission: 'product:read' },
        {
          label: 'Modifier Groups',
          icon: 'fa-puzzle-piece',
          route: '/modifier-groups',
          permission: 'product:read',
        },
        {
          label: 'Addon Groups',
          icon: 'fa-layer-group', // o 'fa-puzzle-piece', 'fa-layer-group', scegli tu
          route: '/addon-groups',
          permission: 'product:read',
        },
        { label: 'Materials', icon: 'fa-flask', route: '/materials', permission: 'inventory:read' },
      ],
    },
    {
      label: 'Inventory',
      icon: 'fa-boxes-stacked',
      permission: 'inventory:read',
      items: [
        {
          label: 'Stock',
          icon: 'fa-cubes',
          route: '/inventory/stock',
          permission: 'inventory:read',
        },
        {
          label: 'Movements',
          icon: 'fa-arrow-right-arrow-left',
          route: '/inventory/movements',
          permission: 'inventory:read',
        },
        { label: 'Suppliers', icon: 'fa-truck', route: '/suppliers', permission: 'inventory:read' },
        {
          label: 'Purchase Orders',
          icon: 'fa-file-invoice',
          route: '/inventory/purchase-orders',
          permission: 'inventory:read',
        },
        {
          label: 'Starting Balance',
          icon: 'fa-boxes-packing',
          route: '/inventory/starting-balance',
          permission: 'inventory:read',
        },
      ],
    },
    {
      label: 'Sales',
      icon: 'fa-cash-register',
      permission: 'report:read',
      items: [
        {
          label: 'Sales Report',
          icon: 'fa-chart-line',
          route: '/sales-report',
          permission: 'report:read',
        },
        { label: 'Shifts', icon: 'fa-clock', route: '/sales/shifts', permission: 'report:read' },
        {
          label: 'Cash Movements',
          icon: 'fa-money-bill-transfer',
          route: '/sales/cash-movements',
          permission: 'report:read',
        },
      ],
    },
    {
      label: 'Admin',
      icon: 'fa-shield-halved',
      permission: 'user:read',
      items: [
        { label: 'Users', icon: 'fa-users', route: '/users', permission: 'user:read' },
        { label: 'Roles', icon: 'fa-user-shield', route: '/roles', permission: 'role:read' },
      ],
    },
  ];

  /** Gruppi filtrati in base ai permessi dell'utente */
  readonly groups = signal<MenuGroup[]>([]);

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.user$ = this.auth.user$;
    this.filterGroups();
  }

  private filterGroups(): void {
    const filtered = this.allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => this.auth.hasPermission(item.permission)),
      }))
      .filter((group) => group.items.length > 0);
    this.groups.set(filtered);
  }

  toggleGroup(groupLabel: string): void {
    this.expandedGroups.update((state) => ({
      ...state,
      [groupLabel.toLowerCase()]: !state[groupLabel.toLowerCase()],
    }));
  }

  isExpanded(groupLabel: string): boolean {
    return this.expandedGroups()[groupLabel.toLowerCase()] ?? false;
  }

  isGroupActive(group: MenuGroup): boolean {
    return group.items.some((item) => this.router.url.startsWith(item.route));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
