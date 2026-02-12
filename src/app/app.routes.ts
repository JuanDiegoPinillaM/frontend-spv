import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './modules/admin/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth-guard';
import { InventoryListComponent } from './modules/inventory/inventory-list.component/inventory-list.component';
import { PosTerminalComponent } from './modules/pos/pos-terminal.component/pos-terminal.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  
  // Rutas protegidas
  { 
    path: 'admin', 
    component: AdminLayoutComponent, // Usa el Layout que creamos
    canActivate: [authGuard],        // Protegido por el Guard
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'pos', component: PosTerminalComponent }, // Dentro de los children de 'admin'
    ]
  },
  
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];