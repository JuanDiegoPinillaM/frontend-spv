import { Component, inject, signal, Output, EventEmitter, computed } from '@angular/core'; // Añadido computed
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms'; // Añadido FormsModule
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { InventoryService } from '../../../core/services/inventory.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  // Agregamos FormsModule para que funcione el [ngModel] del buscador
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FeatherModule], 
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss']
})
export class InventoryFormComponent {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  
  @Output() onSaveSuccess = new EventEmitter<void>();
  @Output() onCancelEvent = new EventEmitter<void>();

  // --- NUEVAS SEÑALES PARA FILTROS (Requeridas por tu HTML) ---
  searchTerm = signal('');
  selectedCategory = signal('Todas');
  categories = signal(['Todas', 'General', 'Electrónica', 'Alimentos']); // Ajusta según tus necesidades
  showModal = signal(false);
  products = signal<any[]>([]); // Aquí deberías cargar los productos desde el servicio
  isLoading = signal(false);

  // Lógica de filtrado para la tabla
  filteredProducts = computed(() => {
    return this.products().filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
                            product.sku.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCategory = this.selectedCategory() === 'Todas' || product.category === this.selectedCategory();
      return matchesSearch && matchesCategory;
    });
  });

  // --- LÓGICA DEL FORMULARIO ---
  productForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(3)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    category: ['General']
  });

  // Método para cerrar el modal (llamado desde el HTML)
  handleCloseModal() {
    this.showModal.set(false);
    // Aquí podrías recargar la lista de productos
  }

  onSubmit() {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.inventoryService.createProduct(this.productForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        Swal.fire({
          icon: 'success',
          title: '¡Producto Creado!',
          confirmButtonColor: '#6366f1',
          timer: 2000
        });
        this.productForm.reset({ category: 'General', price: 0 });
        this.showModal.set(false); // Cerramos el modal al terminar
        this.onSaveSuccess.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el producto' });
      }
    });
  }

  onCancel() {
    this.showModal.set(false);
    this.onCancelEvent.emit();
  }
}