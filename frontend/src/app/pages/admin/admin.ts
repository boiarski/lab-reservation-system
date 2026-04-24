import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

type Notification = {
  type: 'success' | 'error';
  message: string;
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  currentUser = signal<any | null>(null);
  equipment = signal<any[]>([]);
  users = signal<any[]>([]);

  newUserName = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserRole = 'user';

  newEquipmentName = '';
  newEquipmentDescription = '';

  isLoading = signal(false);
  actionLoadingId = signal<number | string | null>(null);

  notification = signal<Notification | null>(null);

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.auth.getUser());

    if (this.isHelperOrAdmin()) {
      this.loadEquipment();
    }

    if (this.isAdmin()) {
      this.loadUsers();
    }
  }

  showSuccess(message: string) {
    this.notification.set({ type: 'success', message });
  }

  showError(message: string) {
    this.notification.set({ type: 'error', message });
  }

  closeNotification() {
    this.notification.set(null);
  }

  loadEquipment() {
    this.isLoading.set(true);

    this.api.getEquipment().subscribe({
      next: (data: any[]) => {
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

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (data: any[]) => {
        this.users.set(data);
      },
      error: (err: any) => {
        console.error(err);
        this.showError('Could not load users');
      }
    });
  }

  createUser() {
    this.closeNotification();

    const name = this.newUserName.trim();
    const email = this.newUserEmail.trim().toLowerCase();
    const password = this.newUserPassword.trim();

    if (!name || !email || !password) {
      this.showError('Name, email and password are required');
      return;
    }

    this.api.createUser({
      name,
      email,
      password,
      role: this.newUserRole
    }).subscribe({
      next: () => {
        this.showSuccess('User created successfully.');
        this.newUserName = '';
        this.newUserEmail = '';
        this.newUserPassword = '';
        this.newUserRole = 'user';

        if (this.isAdmin()) {
          this.loadUsers();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not create user');
      }
    });
  }

  updateUserRole(user: any, role: string) {
    this.actionLoadingId.set(`user-role-${user.id}`);
    this.closeNotification();

    this.api.updateUserRole(user.id, { role }).subscribe({
      next: () => {
        this.showSuccess('User role updated successfully.');
        this.actionLoadingId.set(null);
        this.loadUsers();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not update user role');
        this.actionLoadingId.set(null);
      }
    });
  }

  updateUserStatus(user: any, active: boolean) {
    this.actionLoadingId.set(`user-status-${user.id}`);
    this.closeNotification();

    this.api.updateUserStatus(user.id, { active }).subscribe({
      next: () => {
        this.showSuccess(
          active
            ? 'User activated successfully.'
            : 'User deactivated successfully.'
        );
        this.actionLoadingId.set(null);
        this.loadUsers();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not update user status');
        this.actionLoadingId.set(null);
      }
    });
  }

  createEquipment() {
    this.closeNotification();

    const name = this.newEquipmentName.trim();
    const description = this.newEquipmentDescription.trim();

    if (!name) {
      this.showError('Equipment name is required');
      return;
    }

    this.api.createEquipment({
      name,
      description
    }).subscribe({
      next: () => {
        this.showSuccess('Equipment created successfully.');
        this.newEquipmentName = '';
        this.newEquipmentDescription = '';
        this.loadEquipment();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not create equipment');
      }
    });
  }

  decommissionEquipment(item: any) {
    this.actionLoadingId.set(`equipment-decommission-${item.id}`);
    this.closeNotification();

    this.api.decommissionEquipment(item.id).subscribe({
      next: () => {
        this.showSuccess('Equipment decommissioned successfully.');
        this.actionLoadingId.set(null);
        this.loadEquipment();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not decommission equipment');
        this.actionLoadingId.set(null);
      }
    });
  }

  updateEquipmentStatus(item: any, status: string) {
    this.actionLoadingId.set(item.id);
    this.closeNotification();

    this.api.updateEquipmentStatus(item.id, { status }).subscribe({
      next: () => {
        this.showSuccess('Equipment status updated successfully.');
        this.actionLoadingId.set(null);
        this.loadEquipment();
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not update equipment status');
        this.actionLoadingId.set(null);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isHelperOrAdmin(): boolean {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'helper';
  }
}