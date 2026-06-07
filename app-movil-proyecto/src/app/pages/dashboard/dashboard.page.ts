import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioViewModel } from '../../viewmodels/usuario.viewmodel';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {

  readonly cargando$ = this.vm.cargandoDashboard$;
  readonly datos$ = this.vm.dashboardData$;
  readonly error$ = this.vm.error$;

  constructor(
    private vm: UsuarioViewModel,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vm.cargarDashboard(this.obtenerIdDelToken());
  }

  ngOnDestroy(): void {
    this.vm.destruirDashboard();
  }

  cerrarSesion(): void {
    this.authService.eliminarToken();
    this.router.navigate(['/login']);
  }

  private obtenerIdDelToken(): number {
    const token = this.authService.obtenerToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id ?? 0;
    } catch {
      return 0;
    }
  }
}
