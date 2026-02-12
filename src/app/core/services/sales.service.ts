import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/sales';

  // Obtener resumen del día
  getDailySummary(branchId?: string) {
    let url = `${this.apiUrl}/dashboard/summary`;
    // Si enviamos branchId lo agregamos, si no, el backend decide (Global para Owner)
    if (branchId) {
      url += `?branchId=${branchId}`;
    }
    return this.http.get<any>(url);
  }

  createSale(saleData: any) {
    return this.http.post(`${this.apiUrl}`, saleData); // Envía a /api/sales
  }
}