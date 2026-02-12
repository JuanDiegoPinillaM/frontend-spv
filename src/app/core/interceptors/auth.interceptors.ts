import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos el token en la caja fuerte (localStorage)
  const token = localStorage.getItem('token');

  // 2. Si existe, clonamos la petición y le pegamos el header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // 3. Si no hay token, mandamos la petición tal cual (el backend la rechazará si es privada)
  return next(req);
};