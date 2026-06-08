import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false,
})
export class EditarPage implements OnInit, OnDestroy {

  formulario: FormGroup;
  usuarioId!: number;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;
  private sub = new Subscription();

  constructor(
    private fb: FormBuilder,
    private vm: UsuarioViewModel,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.vm.cargarUsuarioPorId(this.usuarioId);
    this.sub.add(
      this.vm.usuarioActual$.pipe(filter(u => !!u), take(1)).subscribe(usuario => {
        this.formulario.patchValue({ nombre: usuario!.nombre, email: usuario!.email });
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get nombre() { return this.formulario.get('nombre'); }
  get email() { return this.formulario.get('email'); }

  actualizar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.vm.actualizarUsuario(this.usuarioId, this.formulario.value);
    const s = this.vm.cargando$.pipe(filter(c => !c), take(1)).subscribe(() => {
      this.router.navigate(['/usuarios']);
    });
    this.sub.add(s);
  }
}
