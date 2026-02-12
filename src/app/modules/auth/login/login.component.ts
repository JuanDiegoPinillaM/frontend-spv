import { Component, inject } from '@angular/core';
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
export class LoginComponent {
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
    // Cargar credenciales guardadas si existen
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
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    // Guardar email si "Recordarme" está activado
    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', credentials.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Toast de bienvenida
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Acceso correcto como ${response.user?.fullName || 'Usuario'}`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });

        // Redirigir según el rol
        const userRole = response.user?.role;
        if (userRole === 'OWNER' || userRole === 'MANAGER') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/admin/pos']); // Cajeros directo al POS
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        
        // Mensajes de error más específicos
        let errorMessage = 'Credenciales incorrectas';
        let errorTitle = 'Error de autenticación';

        if (err.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (err.status === 403) {
          errorMessage = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
          errorTitle = 'Cuenta desactivada';
        } else if (err.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          errorTitle = 'Error de conexión';
        }

        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}