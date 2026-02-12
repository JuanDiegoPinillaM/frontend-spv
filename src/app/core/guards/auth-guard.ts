import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.token) {
    return true; // Tiene token, pasa
  } else {
    router.navigate(['/auth/login']); // No tiene token, fuera
    return false;
  }
};