import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false,
})
export class CrearPage implements OnDestroy {

  formulario: FormGroup;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;
  private sub = new Subscription();

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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
    const s = this.vm.cargando$.pipe(filter(c => !c), take(1)).subscribe(() => {
      if (!this.vm['_error$'].value) this.router.navigate(['/usuarios']);
    });
    this.sub.add(s);
  }
}
