import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // NUOVE PAGINE - Gestione Sede / Magazzini / POS
      {
        path: 'company',
        loadComponent: () =>
          import('./features/company/company.component').then((m) => m.CompanyPageComponent),
      },
      {
        path: 'warehouses',
        loadComponent: () =>
          import('./features/warehouse/warehouse.component').then((m) => m.WarehousePageComponent),
      },
      {
        path: 'pos-clients',
        loadComponent: () =>
          import('./features/pos-client/pos-client.component').then(
            (m) => m.PosClientPageComponent,
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles.component').then((m) => m.RolesComponent),
      },
      {
        path: 'modifier-groups',
        loadComponent: () =>
          import('./features/modifier-groups/modifier-groups.component').then(
            (m) => m.ModifierGroupsComponent,
          ),
      },
      {
        path: 'addon-groups',
        loadComponent: () =>
          import('./features/addon-groups/addon-groups.component').then(
            (m) => m.AddonGroupsComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/product-categories/product-categories.component').then(
            (m) => m.ProductCategoriesComponent,
          ),
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./features/materials/materials.component').then((m) => m.MaterialsComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'sales-report',
        loadComponent: () =>
          import('./features/sales-report/sales-report.component').then(
            (m) => m.SalesReportComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
