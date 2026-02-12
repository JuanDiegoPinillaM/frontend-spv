import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { SalesService } from '../../../core/services/sales.service';
import { FeatherModule } from 'angular-feather';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [CommonModule, FeatherModule, FormsModule],
  templateUrl: './pos-terminal.component.html',
  styleUrls: ['./pos-terminal.component.scss']
})
export class PosTerminalComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private salesService = inject(SalesService);

  products = signal<any[]>([]);
  cart = signal<any[]>([]);
  searchTerm = signal('');
  paymentMethod = signal<'CASH' | 'TRANSFER'>('CASH');

  // Cálculos automáticos (Signals)
  subtotal = computed(() => 
    this.cart().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  filteredProducts = computed(() => 
    this.products().filter(p => 
      p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
      p.sku.toLowerCase().includes(this.searchTerm().toLowerCase())
    )
  );

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // 🆕 CAMBIO: Usar getProductsForPOS en lugar de getProducts
    // Esto trae los productos CON su stock de la sucursal del usuario
    this.inventoryService.getProductsForPOS().subscribe({
      next: (data) => {
        console.log('✅ Productos cargados con stock:', data);
        this.products.set(data);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar productos',
          text: 'No se pudieron cargar los productos del inventario',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  addToCart(product: any) {
    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item._id === product._id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const availableStock = product.stock ?? 0;

    if (currentQty + 1 > availableStock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `Solo hay ${availableStock} unidades disponibles`,
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    if (existingItem) {
      existingItem.quantity++;
      this.cart.set([...currentCart]);
    } else {
      this.cart.set([...currentCart, { ...product, quantity: 1 }]);
    }

    // Feedback visual
    this.showToast('Producto agregado', 'success');
  }

  increaseQuantity(index: number) {
    const currentCart = [...this.cart()];
    const item = currentCart[index];
    const availableStock = item.stock ?? 0;

    if (item.quantity < availableStock) {
      item.quantity++;
      this.cart.set(currentCart);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Stock máximo',
        text: `Solo hay ${availableStock} unidades disponibles`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  decreaseQuantity(index: number) {
    const currentCart = [...this.cart()];
    const item = currentCart[index];

    if (item.quantity > 1) {
      item.quantity--;
      this.cart.set(currentCart);
    }
  }

  removeFromCart(index: number) {
    const newCart = [...this.cart()];
    newCart.splice(index, 1);
    this.cart.set(newCart);
    this.showToast('Producto eliminado', 'info');
  }

  clearCart() {
    if (this.cart().length === 0) return;

    Swal.fire({
      title: '¿Limpiar carrito?',
      text: 'Se eliminarán todos los productos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cart.set([]);
        this.showToast('Carrito limpiado', 'success');
      }
    });
  }

  getTotalItems(): number {
    return this.cart().reduce((acc, item) => acc + item.quantity, 0);
  }

  processSale() {
    if (this.cart().length === 0) return;

    Swal.fire({
      title: 'Confirmar venta',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>Total:</strong> ${this.subtotal().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
          <p><strong>Método:</strong> ${this.paymentMethod() === 'CASH' ? 'Efectivo' : 'Transferencia'}</p>
          <p><strong>Items:</strong> ${this.getTotalItems()}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Procesar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmSale();
      }
    });
  }

  private confirmSale() {
    const saleData = {
      items: this.cart().map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: this.paymentMethod(),
      total: this.subtotal()
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Guardando venta',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.salesService.createSale(saleData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Venta Exitosa!',
          html: `
            <div style="text-align: left; padding: 1rem;">
              <p><strong>Total:</strong> ${this.subtotal().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
              <p><strong>Método:</strong> ${this.paymentMethod() === 'CASH' ? 'Efectivo 💵' : 'Transferencia 📱'}</p>
              <p><strong>Items:</strong> ${this.getTotalItems()}</p>
            </div>
          `,
          confirmButtonColor: '#6366f1',
          confirmButtonText: 'Nueva Venta'
        });
        
        // Limpiar carrito y recargar productos
        this.cart.set([]);
        this.paymentMethod.set('CASH');
        this.loadProducts();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar',
          text: err.error?.message || 'No se pudo completar la venta',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  private showToast(message: string, icon: 'success' | 'error' | 'info' | 'warning') {
    Swal.fire({
      icon: icon,
      title: message,
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }

  // Atajo de teclado F10 para procesar venta
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F10') {
      event.preventDefault();
      if (this.cart().length > 0) {
        this.processSale();
      }
    }
  }
}