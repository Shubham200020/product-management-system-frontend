import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { identifier: '', password: '' };
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401 || err.status === 403) {
          this.error = 'Invalid email or password';
        } else if (err.error) {
          if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.error.message) {
            this.error = err.error.message;
          } else if (err.error.error) {
            this.error = err.error.error;
          } else {
            this.error = `Error ${err.status}: ${err.statusText || 'Server Error'}`;
          }
        } else {
          this.error = `Connection Error (Status ${err.status}). Please verify that your backend server is online.`;
        }
        this.loading = false;
      }
    });
  }
}
