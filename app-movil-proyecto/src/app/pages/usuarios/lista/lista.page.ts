import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioViewModel } from '../../../viewmodels/usuario.viewmodel';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  standalone: false,
})
export class ListaPage implements OnInit {

  readonly usuarios$ = this.vm.usuarios$;
  readonly cargando$ = this.vm.cargando$;
  readonly error$ = this.vm.error$;

  constructor(
    public router: Router,
    private vm: UsuarioViewModel,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.vm.cargarUsuarios();
  }

  editar(id: number): void {
    this.router.navigate(['/usuarios', id, 'editar']);
  }

  async confirmarEliminar(id: number): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Eliminar este usuario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => this.vm.eliminarUsuario(id) }
      ]
    });
    await alerta.present();
  }
}
