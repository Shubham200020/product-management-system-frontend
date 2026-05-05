import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  request = {
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  loading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;

  private apiUrl = 'http://localhost:8080/api/auth/forgot-password';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.request.newPassword !== this.request.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(this.apiUrl, this.request).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reset password. Please check your details.';
        this.loading = false;
      }
    });
  }
}
