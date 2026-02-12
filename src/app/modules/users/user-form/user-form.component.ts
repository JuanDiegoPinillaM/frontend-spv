// src/app/modules/users/user-form/user-form.component.ts
import { Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { BranchesService } from '../../../core/services/branches.service';
import Swal from 'sweetalert2';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FeatherModule], // Agregar FeatherModule para usar iconos en el formulario
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  // ... (Resto del código idéntico: @Input, Services, FormBuilder, lógica de submit)
  @Input() user: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserAdminService);
  private authService = inject(AuthService);
  private branchesService = inject(BranchesService);

  userForm!: FormGroup;
  branches = signal<any[]>([]);
  isLoading = false;
  availableRoles: string[] = [];
  
  get isOwner() { return this.authService.currentUser()?.role === 'OWNER'; }

  ngOnInit() {
    this.setupRoles();
    if (this.isOwner) this.loadBranches();
    this.initForm();
  }

  // ... (setupRoles, loadBranches se mantienen igual)
  setupRoles() {
    if (this.isOwner) {
        this.availableRoles = ['OWNER', 'MANAGER', 'CASHIER'];
    } else {
        this.availableRoles = ['CASHIER'];
    }
  }

  loadBranches() {
    this.branchesService.getBranches().subscribe(data => this.branches.set(data));
  }


  initForm() {
    const branchValidators: ValidatorFn[] = [];
    this.userForm = this.fb.group({
      fullName: [this.user?.fullName || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(6)]],
      role: [this.user?.role || 'CASHIER', Validators.required],
      documentType: [this.user?.documentType || 'CC', Validators.required],
      documentNumber: [this.user?.documentNumber || '', Validators.required],
      hiringDate: [this.formatDate(this.user?.hiringDate), Validators.required],
      branchId: [this.user?.branch?._id || this.user?.branch || '', branchValidators]
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    return new Date(dateStr).toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.userForm.value;
    if (this.user && !formData.password) delete formData.password;

    const request$ = this.user 
      ? this.userService.updateUser(this.user._id, formData)
      : this.userService.createUser(formData);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        const msg = (!this.isOwner && !this.user) 
          ? 'Usuario creado. Debe ser aprobado por el Owner.' 
          : 'Usuario guardado correctamente.';

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: msg,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'swal2-popup' }
        });
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', err.error?.message || 'Ocurrió un error', 'error');
      }
    });
  }
}