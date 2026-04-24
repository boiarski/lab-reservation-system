import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

type EquipmentItem = {
  id: number | string;
  name: string;
  description: string | null;
  status: string;
};

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment.html',
  styleUrl: './equipment.css'
})
export class EquipmentComponent implements OnInit {
  equipment = signal<EquipmentItem[]>([]);
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getEquipment().subscribe({
      next: (data: EquipmentItem[]) => {
        this.equipment.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage.set('Could not load equipment');
        this.isLoading.set(false);
      }
    });
  }

  openEquipment(item: EquipmentItem) {
    this.router.navigate(['/equipment', item.id]);
  }
}