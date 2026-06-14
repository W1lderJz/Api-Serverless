import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage {

  formulario: FormGroup;
  cargando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private notificacionService: NotificacionService
  ) {
    this.formulario = this.fb.group({
      email:   ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  get email()   { return this.formulario.get('email'); }
  get subject() { return this.formulario.get('subject'); }
  get message() { return this.formulario.get('message'); }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    this.notificacionService.enviar(this.formulario.value).subscribe({
      next: res => {
        this.mensajeExito = res.mensaje || 'Mensaje enviado correctamente';
        this.formulario.reset();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Error al enviar mensaje';
        this.cargando = false;
      }
    });
  }
}
