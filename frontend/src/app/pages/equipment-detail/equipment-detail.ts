import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.css'
})
export class EquipmentDetailComponent implements OnInit {
  equipment = signal<any | null>(null);
  reservations = signal<any[]>([]);
  isLoading = signal(false);

  issueReason = '';
  isReportingIssue = signal(false);

  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const equipmentId = this.route.snapshot.paramMap.get('id');

    if (!equipmentId) {
      this.showError('Equipment id was not provided');
      return;
    }

    this.loadAvailability(equipmentId);
  }

  loadAvailability(equipmentId: string) {
    this.isLoading.set(true);
    this.closeNotification();

    this.api.getEquipmentAvailability(equipmentId).subscribe({
      next: (data: any) => {
        this.equipment.set(data.equipment);
        this.reservations.set(data.reservations);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.showError('Could not load equipment details');
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

  reportIssue() {
    const currentEquipment = this.equipment();

    if (!currentEquipment) {
      this.showError('Equipment was not loaded');
      return;
    }

    if (!this.issueReason.trim()) {
      this.showError('Issue reason is required');
      return;
    }

    this.isReportingIssue.set(true);
    this.closeNotification();

    this.api.reportEquipmentIssue(currentEquipment.id, {
      reason: this.issueReason
    }).subscribe({
      next: () => {
        this.showSuccess('Equipment issue reported successfully.');
        this.issueReason = '';
        this.isReportingIssue.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not report equipment issue');
        this.isReportingIssue.set(false);
      }
    });
  }
}