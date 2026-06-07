import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  standalone: false,
})
export class EditarPage implements OnInit {

  formulario: FormGroup;
  usuarioId!: number;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;

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
    this.vm.usuarioActual$.subscribe(usuario => {
      if (usuario) {
        this.formulario.patchValue({ nombre: usuario.nombre, email: usuario.email });
      }
    });
  }

  get nombre() { return this.formulario.get('nombre'); }
  get email() { return this.formulario.get('email'); }

  actualizar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.vm.actualizarUsuario(this.usuarioId, this.formulario.value);
    this.vm.cargando$.subscribe(cargando => {
      if (!cargando) this.router.navigate(['/usuarios']);
    });
  }
}
