import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { EquipmentComponent } from './pages/equipment/equipment';
import { EquipmentDetailComponent } from './pages/equipment-detail/equipment-detail';
import { ReservationCreateComponent } from './pages/reservation-create/reservation-create';
import { ManageAccountComponent } from './pages/manage-account/manage-account';
import { AdminComponent } from './pages/admin/admin';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },

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
    path: 'equipment/:id/reserve',
    component: ReservationCreateComponent,
    canActivate: [authGuard]
  },

  {
    path: 'manage-account',
    component: ManageAccountComponent,
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