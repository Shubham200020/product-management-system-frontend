import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { SalesComponent } from './pages/sales/sales.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ShopsComponent } from './pages/shops/shops.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { InventoryReportComponent } from './pages/inventory-report/inventory-report.component';
import { ProductCatalogComponent } from './pages/product-catalog/product-catalog.component';
import { ProfitReportComponent } from './pages/profit-report/profit-report.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'shops', component: ShopsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'inventory-report', component: InventoryReportComponent },
      { path: 'product-catalog', component: ProductCatalogComponent },
      { path: 'profit-report', component: ProfitReportComponent },
      { path: 'users', component: UserManagementComponent, data: { roles: ['ADMIN'] } },
 // Placeholder for User Management
      { path: 'sales', component: SalesComponent, data: { roles: ['ADMIN', 'SHOPKEEPER'] } }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
