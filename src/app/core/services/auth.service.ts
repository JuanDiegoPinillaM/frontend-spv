import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Usamos el Proxy que configuraremos en el siguiente paso, por eso solo ponemos /api
  private apiUrl = '/api/auth'; 

  // Signals de Angular 17+ para manejar el estado reactivo
  currentUser = signal<any>(this.getUserFromStorage());

  login(credentials: {email: string, password: string}) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // 1. Guardar Token
        localStorage.setItem('token', response.access_token);
        
        // 2. Decodificar y guardar usuario
        const decoded: any = jwtDecode(response.access_token);
        const user = {
          fullName: response.user.fullName,
          role: decoded.role,
          branchId: decoded.branchId,
          email: decoded.email
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user); // Actualizamos la señal
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private getUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  get token() {
    return localStorage.getItem('token');
  }
}