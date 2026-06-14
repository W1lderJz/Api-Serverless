import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

import { LoginPage } from './pages/login/login.page';
import { RegistroPage } from './pages/registro/registro.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { ListaPage } from './pages/usuarios/lista/lista.page';
import { CrearPage } from './pages/usuarios/crear/crear.page';
import { EditarPage } from './pages/usuarios/editar/editar.page';
import { SubirPage } from './pages/archivos/subir/subir.page';
import { DetallePage } from './pages/usuarios/detalle/detalle.page';
import { NotificacionesPage } from './pages/notificaciones/notificaciones.page';

@NgModule({
  declarations: [
    AppComponent,
    LoginPage,
    RegistroPage,
    DashboardPage,
    ListaPage,
    DetallePage,
    CrearPage,
    EditarPage,
    SubirPage,
    NotificacionesPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
