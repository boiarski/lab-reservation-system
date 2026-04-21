import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.css'
})
export class EquipmentDetailComponent implements OnInit {
  equipment = signal<any | null>(null);
  reservations = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const equipmentId = this.route.snapshot.paramMap.get('id');

    if (!equipmentId) {
      this.errorMessage.set('Equipment id was not provided');
      return;
    }

    this.loadAvailability(equipmentId);
  }

  loadAvailability(equipmentId: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getEquipmentAvailability(equipmentId).subscribe({
      next: (data: any) => {
        this.equipment.set(data.equipment);
        this.reservations.set(data.reservations);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage.set('Could not load equipment details');
        this.isLoading.set(false);
      }
    });
  }
}