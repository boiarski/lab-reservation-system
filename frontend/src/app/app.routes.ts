import { Routes } from '@angular/router';
import { EquipmentListComponent } from './components/equipment-list/equipment-list';
import { ReservationFormComponent } from './components/reservation-form/reservation-form';
import { ReservationsListComponent } from './components/reservations-list/reservations-list';

export const routes: Routes = [
  { path: '', component: EquipmentListComponent },
  { path: 'reserve/:id', component: ReservationFormComponent },
  { path: 'reservations', component: ReservationsListComponent }
];