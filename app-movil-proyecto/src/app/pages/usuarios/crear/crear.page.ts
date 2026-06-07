import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  standalone: false,
})
export class CrearPage {

  formulario: FormGroup;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;

  constructor(
    private fb: FormBuilder,
    private vm: UsuarioViewModel,
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

  crear(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.vm.crearUsuario(this.formulario.value);
    this.vm.cargando$.subscribe(cargando => {
      if (!cargando) this.router.navigate(['/usuarios']);
    });
  }
}
