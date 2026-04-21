import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { EquipmentComponent } from './pages/equipment/equipment';
import { EquipmentDetailComponent } from './pages/equipment-detail/equipment-detail';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: 'equipment',
    component: EquipmentComponent,
    canActivate: [authGuard]
  },

  {
    path: 'equipment/:id',
    component: EquipmentDetailComponent,
    canActivate: [authGuard]
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];