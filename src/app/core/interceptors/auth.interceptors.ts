import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const authService = inject(AuthService); // Necesitamos el servicio para limpiar Signals

  // 1. Si existe, clonamos la petición y le pegamos el header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Mandamos la petición y estamos atentos a posibles rechazos del servidor
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: El token expiró o fue revocado
      if (error.status === 401) {
        // Evitamos mostrar alerta si el error viene de la pantalla de login
        if (!req.url.includes('/login')) {
          Swal.fire({
            icon: 'warning',
            title: 'Sesión Expirada',
            text: 'Tu sesión ha terminado. Por favor, inicia sesión nuevamente.',
            timer: 3000,
            showConfirmButton: false
          });
        }
        
        // Limpiamos todo rastro y lo echamos
        authService.logout(); 
      }
      
      return throwError(() => error);
    })
  );
};