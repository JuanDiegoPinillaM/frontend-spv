import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AdminLayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard'; // ✅ Importar el nuevo guard
import { InventoryListComponent } from './modules/inventory/inventory-list.component/inventory-list.component';
import { PosTerminalComponent } from './modules/pos/pos-terminal.component/pos-terminal.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    canActivate: [authGuard], // 1. Verifica login
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [roleGuard],       // ✅ 2. Verifica Rol
        data: { roles: ['OWNER', 'MANAGER'] } // 👈 Solo estos entran
      },
      { 
        path: 'users', 
        component: UserListComponent,
        canActivate: [roleGuard],
        data: { roles: ['OWNER', 'MANAGER'] } // 👈 Cajero BLOQUEADO aquí
      }, 
      { 
        path: 'inventory', 
        component: InventoryListComponent,
        canActivate: [roleGuard],
        data: { roles: ['OWNER', 'MANAGER'] }
      },
      { 
        path: 'pos', 
        component: PosTerminalComponent,
        canActivate: [roleGuard],
        data: { roles: ['OWNER', 'MANAGER', 'CASHIER'] } // 👈 Aquí sí entran todos
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];