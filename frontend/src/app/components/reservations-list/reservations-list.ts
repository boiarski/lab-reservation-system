import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations-list.html'
})
export class ReservationsListComponent implements OnInit {

  // Use a signal for reactive data handling
  reservations = signal<any[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    console.log('LOADING RESERVATIONS');

    this.api.getReservations().subscribe({
      next: (data) => {
        console.log('RESERVATIONS:', data);
        // Update the signal value
        this.reservations.set(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}