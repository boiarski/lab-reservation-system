import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  dashboard = signal<any | null>(null);
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  isLoading = signal(false);
  actionLoadingId = signal<number | string | null>(null);

  rejectingReservationId = signal<number | string | null>(null);
  rejectionReason = '';
  suggestedStartDate = '';
  suggestedEndDate = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading.set(true);

    this.api.getDashboard().subscribe({
      next: (data: any) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.showError('Could not load dashboard');
        this.isLoading.set(false);
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  showSuccess(message: string) {
    this.notification.set({
      type: 'success',
      message
    });
  }

  showError(message: string) {
    this.notification.set({
      type: 'error',
      message
    });
  }

  closeNotification() {
    this.notification.set(null);
  }

  cancelReservation(id: number | string) {
    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.cancelReservation(id).subscribe({
      next: () => {
        this.showSuccess('Reservation cancelled successfully.');
        this.actionLoadingId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not cancel reservation');
        this.actionLoadingId.set(null);
      }
    });
  }

  completeReservation(id: number | string) {
    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.completeReservation(id).subscribe({
      next: () => {
        this.showSuccess('Reservation completed successfully.');
        this.actionLoadingId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not complete reservation');
        this.actionLoadingId.set(null);
      }
    });
  }

  approveReservation(id: number | string) {
    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.approveReservation(id).subscribe({
      next: () => {
        this.showSuccess('Reservation approved successfully.');
        this.actionLoadingId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not approve reservation');
        this.actionLoadingId.set(null);
      }
    });
  }

  startRejectReservation(id: number | string) {
    this.rejectingReservationId.set(id);
    this.rejectionReason = '';
    this.suggestedStartDate = '';
    this.suggestedEndDate = '';
    this.closeNotification();
  }

  cancelRejectReservation() {
    this.rejectingReservationId.set(null);
    this.rejectionReason = '';
    this.suggestedStartDate = '';
    this.suggestedEndDate = '';
  }

  submitRejectReservation(id: number | string) {
    const payload = {
      reason: this.rejectionReason,
      suggestedStartDate: this.suggestedStartDate || null,
      suggestedEndDate: this.suggestedEndDate || null
    };

    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.rejectReservation(id, payload).subscribe({
      next: () => {
        this.showSuccess('Reservation rejected successfully.');
        this.actionLoadingId.set(null);
        this.rejectingReservationId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not reject reservation');
        this.actionLoadingId.set(null);
      }
    });
  }

  confirmReport(id: number | string) {
    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.confirmEquipmentReport(id).subscribe({
      next: () => {
        this.showSuccess('Equipment report confirmed successfully.');
        this.actionLoadingId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not confirm report');
        this.actionLoadingId.set(null);
      }
    });
  }

  dismissReport(id: number | string) {
    this.actionLoadingId.set(id);
    this.closeNotification();

    this.api.dismissEquipmentReport(id).subscribe({
      next: () => {
        this.showSuccess('Equipment report dismissed successfully.');
        this.actionLoadingId.set(null);
        this.loadDashboard();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not dismiss report');
        this.actionLoadingId.set(null);
      }
    });
  }

  canCancel(reservation: any): boolean {
    if (reservation.status !== 'approved') {
      return false;
    }

    const today = new Date();
    const startDate = new Date(reservation.start_date);

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    return today < startDate;
  }

  canComplete(reservation: any): boolean {
    if (reservation.status !== 'approved') {
      return false;
    }

    if (reservation.equipment_status === 'out_of_order') {
      return false;
    }

    const today = new Date();
    const startDate = new Date(reservation.start_date);

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    return today >= startDate;
  }
}