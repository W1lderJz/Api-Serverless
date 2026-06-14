import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { LoginPage } from './pages/login/login.page';
import { RegistroPage } from './pages/registro/registro.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { ListaPage } from './pages/usuarios/lista/lista.page';
import { CrearPage } from './pages/usuarios/crear/crear.page';
import { EditarPage } from './pages/usuarios/editar/editar.page';
import { SubirPage } from './pages/archivos/subir/subir.page';
import { DetallePage } from './pages/usuarios/detalle/detalle.page';
import { NotificacionesPage } from './pages/notificaciones/notificaciones.page';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard] },
  { path: 'usuarios', component: ListaPage, canActivate: [AuthGuard] },
  { path: 'usuarios/crear', component: CrearPage, canActivate: [AuthGuard] },
  { path: 'usuarios/:id', component: DetallePage, canActivate: [AuthGuard] },
  { path: 'usuarios/:id/editar', component: EditarPage, canActivate: [AuthGuard] },
  { path: 'archivos/subir', component: SubirPage, canActivate: [AuthGuard] },
  { path: 'notificaciones', component: NotificacionesPage, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
