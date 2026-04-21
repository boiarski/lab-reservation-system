import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-create.html',
  styleUrl: './reservation-create.css'
})
export class ReservationCreateComponent implements OnInit {
  equipmentId = signal<string | null>(null);
  equipment = signal<any | null>(null);

  startDate = '';
  endDate = '';
  justification = '';

  isLoading = signal(false);
  isSubmitting = signal(false);

  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.equipmentId.set(id);

    if (!id) {
      this.showError('Equipment id was not provided');
      return;
    }

    this.loadEquipment(id);
  }

  loadEquipment(id: string) {
    this.isLoading.set(true);
    this.closeNotification();

    this.api.getEquipmentById(id).subscribe({
      next: (data: any) => {
        this.equipment.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.showError('Could not load equipment');
        this.isLoading.set(false);
      }
    });
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

  submit() {
    this.closeNotification();

    if (!this.equipmentId()) {
      this.showError('Equipment id was not provided');
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.showError('Start date and end date are required');
      return;
    }

    const payload = {
      equipmentId: Number(this.equipmentId()),
      startDate: this.startDate,
      endDate: this.endDate,
      justification: this.justification || null
    };

    this.isSubmitting.set(true);

    this.api.createReservation(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);

        if (response.reservation.status === 'pending_approval') {
          this.showSuccess('Reservation submitted and is pending approval.');
        } else {
          this.showSuccess('Reservation created successfully.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.isSubmitting.set(false);
        this.showError(err.error?.message || 'Could not create reservation');
      }
    });
  }
}