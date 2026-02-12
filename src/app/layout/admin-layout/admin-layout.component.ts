import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FeatherModule } from 'angular-feather'; // Importar iconos
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FeatherModule], // Importamos Feather y Router
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  // Obtenemos el usuario actual (Signal)
  currentUser = this.authService.currentUser;

  // Menú de navegación
  menuItems = [
    { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
    { label: 'Ventas (POS)', icon: 'shopping-cart', route: '/admin/pos' },
    { label: 'Inventario', icon: 'package', route: '/admin/inventory' },
    { label: 'Usuarios', icon: 'users', route: '/admin/users' },
  ];

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