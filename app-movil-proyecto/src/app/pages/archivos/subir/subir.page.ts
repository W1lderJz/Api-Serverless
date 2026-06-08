import { Component } from '@angular/core';
import { ArchivoViewModel } from '../../../viewmodels/archivo.viewmodel';

@Component({
  selector: 'app-subir',
  templateUrl: './subir.page.html',
  styleUrls: ['./subir.page.scss'],
  standalone: false,
})
export class SubirPage {

  readonly estado$ = this.vm.estado$;
  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  esImagen = false;

  constructor(public vm: ArchivoViewModel) {}

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (!input.files?.length) return;

    const archivo = input.files[0];
    this.archivoSeleccionado = archivo;
    this.vm.limpiar();

    if (['image/jpeg', 'image/png', 'image/gif'].includes(archivo.type)) {
      this.esImagen = true;
      this.previewUrl = URL.createObjectURL(archivo);
    } else {
      this.esImagen = false;
      this.previewUrl = null;
    }
  }

  subir(): void {
    if (!this.archivoSeleccionado) return;
    this.vm.subirArchivo(this.archivoSeleccionado);
  }
}
