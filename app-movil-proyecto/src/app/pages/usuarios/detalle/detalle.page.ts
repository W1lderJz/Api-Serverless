import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: false,
})
export class DetallePage implements OnInit {

  readonly usuario$ = this.vm.usuarioActual$;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;
  usuarioId!: number;

  constructor(
    private vm: UsuarioViewModel,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.vm.cargarUsuarioPorId(this.usuarioId);
  }

  editar(): void {
    this.router.navigate(['/usuarios', this.usuarioId, 'editar']);
  }
}
