import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage {

  formulario: FormGroup;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get nombre() { return this.formulario.get('nombre'); }
  get email() { return this.formulario.get('email'); }
  get password() { return this.formulario.get('password'); }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.mensajeError = null;
    this.authService.registro(this.formulario.value).subscribe({
      next: () => {
        this.mensajeExito = 'Registro exitoso. Inicia sesión.';
        this.cargando = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.mensajeError = err.status === 409
          ? 'El email ya está registrado'
          : 'Error al registrar. Intente nuevamente';
        this.cargando = false;
      }
    });
  }
}
