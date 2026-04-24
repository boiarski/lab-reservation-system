import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

type Notification = {
  type: 'success' | 'error';
  message: string;
};

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-account.html',
  styleUrl: './manage-account.css'
})

export class ManageAccountComponent {
  currentPassword = '';
  newPassword = '';

  currentUser: any | null = null;

  isSubmittingPassword = signal(false);
  isDeactivatingAccount = signal(false);
  showDeactivateConfirm = signal(false);

  notification = signal<Notification | null>(null);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {
    this.currentUser = this.auth.getUser();
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

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  submitPasswordChange() {
    const currentPassword = this.currentPassword.trim();
    const newPassword = this.newPassword.trim();

    this.closeNotification();

    if (!currentPassword || !newPassword) {
      this.showError('Current password and new password are required');
      return;
    }

    this.isSubmittingPassword.set(true);

    this.api.changePassword({
      currentPassword,
      newPassword
    }).subscribe({
      next: () => {
        this.showSuccess('Password changed successfully.');
        this.currentPassword = '';
        this.newPassword = '';
        this.isSubmittingPassword.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not change password');
        this.isSubmittingPassword.set(false);
      }
    });
  }

  openDeactivateConfirm() {
    this.closeNotification();
    this.showDeactivateConfirm.set(true);
  }

  cancelDeactivateConfirm() {
    this.showDeactivateConfirm.set(false);
  }

  deactivateAccount() {
    this.closeNotification();
    this.isDeactivatingAccount.set(true);

    this.api.deactivateOwnAccount().subscribe({
      next: () => {
        this.showDeactivateConfirm.set(false);
        this.auth.logout();
        this.isDeactivatingAccount.set(false);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        this.showError(err.error?.message || 'Could not deactivate account');
        this.isDeactivatingAccount.set(false);
      }
    });
  }
}