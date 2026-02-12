import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { FeatherModule } from 'angular-feather';
import { FormsModule } from '@angular/forms';
import { InventoryFormComponent } from '../inventory-form.component/inventory-form.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FeatherModule, FormsModule, InventoryFormComponent],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  // Datos originales del servidor
  products = signal<any[]>([]);
  isLoading = signal(true);

  // Filtros (Signals reactivas)
  searchTerm = signal('');
  selectedCategory = signal('Todas');

  showModal = signal(false); // <--- Nueva señal para el modal

  // Función para cerrar el modal y refrescar la lista
  handleCloseModal() {
    this.showModal.set(false);
    this.loadProducts(); // Refresca los datos para ver el nuevo producto
  }

  // 🚀 Magia de Angular: Lista filtrada automáticamente
  filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
                            p.sku.includes(this.searchTerm());
      const matchesCat = this.selectedCategory() === 'Todas' || p.category === this.selectedCategory();
      return matchesSearch && matchesCat;
    });
  });

  // Categorías únicas para el filtro
  categories = computed(() => {
    const cats = this.products().map(p => p.category).filter(c => !!c);
    return ['Todas', ...new Set(cats)];
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.inventoryService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}