import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si el usuario existe en memoria (Signal)
  if (authService.currentUser()) {
    return true; 
  } else {
    // Si la memoria está vacía (F5 de recarga), podríamos verificar el token aquí,
    // pero como el AuthService lo carga en el constructor, si es nulo es porque no hay sesión real.
    router.navigate(['/auth/login']); 
    return false;
  }
};