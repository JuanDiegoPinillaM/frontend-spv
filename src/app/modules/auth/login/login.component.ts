import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]], 
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  showPassword = false;
  rememberMe = false;

  ngOnInit() {
    // Si el usuario ya está logueado, lo mandamos pa' dentro para que no vea el login
    if (this.authService.currentUser()) {
       this.redirectUser(this.authService.currentUser().role);
       return;
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
      this.rememberMe = true;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    Swal.fire({
      title: '¿Olvidaste tu contraseña?',
      html: `
        <p style="margin-bottom: 1rem;">Contacta al administrador del sistema para restablecer tu contraseña.</p>
        <p style="font-size: 0.9rem; color: #6b7280;">
          <strong>Email:</strong> admin@pos.com<br>
          <strong>Teléfono:</strong> +57 123 456 7890
        </p>
      `,
      icon: 'info',
      confirmButtonColor: '#6366f1',
      confirmButtonText: 'Entendido'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Iniciamos la carga
    const credentials = this.loginForm.value;

    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', credentials.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false; // ✅ CORRECCIÓN: Liberar el botón

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Sesión iniciada como ${response.user?.fullName}`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#ffffff', 
          color: '#111827'
        });

        this.redirectUser(response.user?.role);
      },
      error: (err) => {
        this.isLoading = false; // ✅ CORRECCIÓN CRÍTICA: Liberar el botón en caso de error
        
        let errorMessage = 'Error de conexión. Verifica que el servidor esté activo.';
        let title = 'Error';

        // Manejo detallado de errores HTTP
        if (err.status === 401) {
          errorMessage = 'El correo o la contraseña son incorrectos.';
          title = 'Credenciales Inválidas';
        } else if (err.status === 403) {
          errorMessage = 'Tu cuenta está inactiva o pendiente de aprobación por un administrador.';
          title = 'Acceso Denegado';
        }

        Swal.fire({
          icon: 'error',
          title: title,
          text: errorMessage,
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  // Método auxiliar para evitar duplicar código de redirección
  private redirectUser(role: string) {
    if (role === 'OWNER' || role === 'MANAGER') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/admin/pos']);
    }
  }
}