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

  // Señales reactivas
  products = signal<any[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  selectedCategory = signal('Todas');
  showModal = signal(false);

  // Productos filtrados (computed)
  filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
        p.sku.toLowerCase().includes(this.searchTerm().toLowerCase());
      
      const matchesCat = 
        this.selectedCategory() === 'Todas' || 
        p.category === this.selectedCategory();
      
      return matchesSearch && matchesCat;
    });
  });

  // Categorías únicas (computed)
  categories = computed(() => {
    const cats = this.products()
      .map(p => p.category)
      .filter(c => !!c);
    
    return ['Todas', ...new Set(cats)];
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    
    this.inventoryService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading.set(false);
      }
    });
  }

  handleCloseModal() {
    this.showModal.set(false);
    this.loadProducts(); // Recargar la lista después de crear un producto
  }
}