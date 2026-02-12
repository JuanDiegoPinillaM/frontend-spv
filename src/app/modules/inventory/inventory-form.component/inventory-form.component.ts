import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { InventoryService } from '../../../core/services/inventory.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FeatherModule],
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss']
})
export class InventoryFormComponent {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  
  @Output() onSaveSuccess = new EventEmitter<void>();
  @Output() onCancelEvent = new EventEmitter<void>();

  isLoading = signal(false);

  // Formulario reactivo
  productForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(3)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    category: ['General']
  });

  onSubmit() {
    // Marcar todos los campos como touched para mostrar errores
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#6366f1',
        timer: 3000
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
          text: 'El producto se ha agregado correctamente',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Limpiar formulario
        this.productForm.reset({ 
          category: 'General', 
          price: 0 
        });
        
        // Emitir evento de éxito
        this.onSaveSuccess.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error al crear producto:', err);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: 'No se pudo crear el producto. Inténtelo nuevamente.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  onCancel() {
    // Verificar si el formulario tiene cambios
    if (this.productForm.dirty) {
      Swal.fire({
        icon: 'question',
        title: '¿Descartar cambios?',
        text: 'Los cambios no guardados se perderán',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6366f1'
      }).then((result) => {
        if (result.isConfirmed) {
          this.productForm.reset({ 
            category: 'General', 
            price: 0 
          });
          this.onCancelEvent.emit();
        }
      });
    } else {
      this.onCancelEvent.emit();
    }
  }
}