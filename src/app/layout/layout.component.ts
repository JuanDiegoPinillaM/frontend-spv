import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { FeatherModule } from 'angular-feather';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FeatherModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  // 1. Definimos la lista maestra con permisos
  private allMenuItems = [
    { 
      label: 'Dashboard', 
      icon: 'home', 
      route: '/admin/dashboard', 
      roles: ['OWNER', 'MANAGER'] 
    },
    { 
      label: 'Ventas (POS)', 
      icon: 'shopping-cart', 
      route: '/admin/pos', 
      roles: ['OWNER', 'MANAGER', 'CASHIER'] // ✅ Cajero puede ver esto
    },
    { 
      label: 'Inventario', 
      icon: 'package', 
      route: '/admin/inventory', 
      roles: ['OWNER', 'MANAGER'] 
    },
    { 
      label: 'Usuarios', 
      icon: 'users', 
      route: '/admin/users', 
      roles: ['OWNER', 'MANAGER'] 
    },
  ];

  // 2. Getter dinámico que filtra según el rol actual
  get menuItems() {
    const role = this.currentUser()?.role; // Obtenemos el rol del Signal
    
    // Si no hay rol, no mostramos nada (o podrías manejar un default)
    if (!role) return [];

    return this.allMenuItems.filter(item => item.roles.includes(role));
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }
}