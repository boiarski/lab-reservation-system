import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.html'
})
export class ReservationFormComponent {

  equipmentId!: number;

  startDate = '';
  endDate = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {
    this.equipmentId = Number(this.route.snapshot.paramMap.get('id'));
  }

  submit() {
    const data = {
      user_id: 1,
      equipment_id: this.equipmentId,
      start_date: this.startDate,
      end_date: this.endDate
    };

    this.api.createReservations(data).subscribe({
      next: () => {
        alert('You have reserved this equipment!')
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert('Error creating reservation');
      }
    });
  }
}
