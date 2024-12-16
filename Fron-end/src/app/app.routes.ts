import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProductosComponent } from './productos/productos.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ComprarComponent } from './comprar/comprar.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { UserComponent } from './user/user.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: ProductosComponent },
      { path: 'comprar/:id', component: ComprarComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'user', component: UserComponent },
      { path: '**', redirectTo: 'productos' }
    ]
  }
];
