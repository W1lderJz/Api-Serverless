import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  formulario: FormGroup;
  mensajeError: string | null = null;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get email() { return this.formulario.get('email'); }
  get password() { return this.formulario.get('password'); }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.mensajeError = null;
    this.authService.login(this.formulario.value).subscribe({
      next: respuesta => {
        this.authService.guardarToken(respuesta.token);
        this.router.navigate(['/dashboard']);
        this.cargando = false;
      },
      error: err => {
        this.mensajeError = err.status === 401
          ? 'Credenciales inválidas'
          : 'Error al iniciar sesión. Intente nuevamente';
        this.cargando = false;
      }
    });
  }
}
