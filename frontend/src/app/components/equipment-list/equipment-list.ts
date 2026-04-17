import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment-list.html'
})
export class EquipmentListComponent implements OnInit {

  equipment = signal<any[]>([]);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getEquipment().subscribe({
      next: (data) => {
        this.equipment.set(data); // Update the signal
      },
      error: (err) => console.error(err)
    });
  }

  reserve(item: any) {
    this.router.navigate(['/reserve', item.id]);
  }
}