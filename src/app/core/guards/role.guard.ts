import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const expectedRoles = route.data['roles'] as Array<string>;

  // 1. Si no hay usuario logueado, authGuard se encarga, pero por seguridad:
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // 2. Si la ruta no define roles, dejamos pasar (o bloqueamos según tu política)
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // 3. Verificar si el rol del usuario está en la lista permitida
  if (expectedRoles.includes(user.role)) {
    return true;
  }

  Swal.fire({
    icon: 'error',
    title: 'Acceso Denegado',
    // Validamos que el rol exista para evitar mostrar "Tu rol de undefined"
    text: user?.role 
        ? `Tu rol de ${user.role} no tiene permisos para acceder a este módulo.` 
        : 'No tienes los permisos necesarios para acceder a este módulo.',
    timer: 3000,
    timerProgressBar: true, // Agrega una línea de tiempo visual que queda muy bien
    showConfirmButton: false,
    // Aseguramos que use las clases que definimos en el CSS
    customClass: {
        popup: 'swal2-popup'
    }
  });

  if (user.role === 'CASHIER') {
    router.navigate(['/admin/pos']);
  } else {
    router.navigate(['/admin/dashboard']);
  }

  return false;
};