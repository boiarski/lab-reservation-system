import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';

  errorMessage = signal('');
  isSubmitting = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    const email = this.email.trim().toLowerCase();
    const password = this.password;

    this.errorMessage.set('');

    if (!email || !password) {
      this.errorMessage.set('Email and password are required');
      return;
    }

    this.isSubmitting.set(true);

    this.auth.login(email, password).subscribe({
      next: (response: any) => {
        this.auth.saveSession(response.token, response.user);
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error(err);
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Invalid email or password'
        );
      }
    });
  }
}