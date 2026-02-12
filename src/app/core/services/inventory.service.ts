import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductWithStock {
  _id: string;
  sku: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  minStock: number;
  inventoryId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  
  // Rutas del backend
  private productsUrl = '/api/products';
  private inventoryUrl = '/api/inventory';

  // 🆕 NUEVO: Obtener productos CON STOCK para el POS
  getProductsForPOS(branchId?: string): Observable<ProductWithStock[]> {
    if (branchId) {
      // Si se proporciona branchId, usar ese
      return this.http.get<ProductWithStock[]>(`${this.inventoryUrl}/pos/${branchId}`);
    } else {
      // Si no, usar el endpoint que toma el branchId del token
      return this.http.get<ProductWithStock[]>(`${this.inventoryUrl}/pos/my-branch/products`);
    }
  }

  // Obtener catálogo global (SIN stock - solo para admin)
  getProducts() {
    return this.http.get<any[]>(this.productsUrl);
  }

  // Crear producto nuevo
  createProduct(product: any) {
    return this.http.post(this.productsUrl, product);
  }

  // Ver stock de una sede específica (formato con populate)
  getInventoryByBranch(branchId: string) {
    return this.http.get<any[]>(`${this.inventoryUrl}/${branchId}`);
  }

  // Agregar stock (Entrada de mercancía)
  addStock(payload: { product: string, branch: string, quantity: number }) {
    return this.http.post(`${this.inventoryUrl}/add`, payload);
  }

  // 🆕 Ver alertas de stock bajo
  getLowStockAlerts(branchId: string) {
    return this.http.get<any[]>(`${this.inventoryUrl}/${branchId}/alerts`);
  }
}