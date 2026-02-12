// src/app/core/services/user-admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Si tienes environments, la ruta correcta desde core/services suele ser esta:
// import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);
  // Usamos ruta relativa asumiendo que tienes proxy.conf.json configurado
  private apiUrl = '/api/users'; 

  getUsers() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(user: any) {
    return this.http.post(this.apiUrl, user);
  }

  updateUser(id: string, user: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}