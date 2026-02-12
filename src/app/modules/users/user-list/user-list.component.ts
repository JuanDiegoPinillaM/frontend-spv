// src/app/modules/users/user-list/user-list.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserFormComponent } from '../user-form/user-form.component';
import Swal from 'sweetalert2';
import { FeatherModule } from 'angular-feather'; // Importar Feather para los iconos
@Component({
  selector: 'app-user-list',
  standalone: true,
  // 2. Agregar FeatherModule a los imports
  imports: [CommonModule, UserFormComponent, FeatherModule], 
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  private userService = inject(UserAdminService);
  private authService = inject(AuthService);

  // ... (El resto de tu lógica se mantiene igual: users, isLoading, etc.)
  users = signal<any[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  selectedUser = signal<any>(null);

  get myRole() { return this.authService.currentUser()?.role; }
  get isOwner() { return this.myRole === 'OWNER'; }

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleStatus(user: any) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      text: newStatus ? 'El usuario podrá acceder al sistema.' : 'El usuario perderá el acceso.',
      icon: newStatus ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#10b981' : '#ef4444',
      confirmButtonText: `Sí, ${action}`,
      customClass: { popup: 'swal2-popup' } // Usando tu estilo nuevo
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.updateUser(user._id, { isActive: newStatus }).subscribe(() => {
          Swal.fire({ 
            title: 'Hecho', 
            text: `Usuario ${action}do.`, 
            icon: 'success', 
            timer: 1500, 
            showConfirmButton: false 
          });
          this.loadUsers();
        });
      }
    });
  }

  openCreateModal() {
    this.selectedUser.set(null);
    this.showModal.set(true);
  }

  openEditModal(user: any) {
    this.selectedUser.set(user);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
}