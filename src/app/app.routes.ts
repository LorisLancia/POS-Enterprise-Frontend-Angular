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
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./features/materials/materials.component').then((m) => m.MaterialsComponent),
      },
      {
        path: 'units',
        loadComponent: () =>
          import('./features/units/units.component').then((m) => m.UnitsComponent),
      },
      {
        path: 'unit-conversions',
        loadComponent: () =>
          import('./features/unit-conversions/unit-conversions.component').then(
            (m) => m.UnitConversionsComponent,
          ),
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
