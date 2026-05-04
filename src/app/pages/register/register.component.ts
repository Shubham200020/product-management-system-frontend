import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = { 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    role: 'SHOPKEEPER' 
  };
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
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.status === 0) {
          this.error = 'Could not connect to the server. Please ensure the backend is running.';
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else if (err.error && err.error.errors) {
          // Handle validation errors
          this.error = Object.values(err.error.errors).join(', ');
        } else {
          this.error = 'Registration failed. Please try again later.';
        }
        this.loading = false;
      }
    });
  }
}
