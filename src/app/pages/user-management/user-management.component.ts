import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading = true;
  showAdminForm = false;
  newAdmin = { name: '', email: '', password: '', phone: '' };
  currentUserEmail = '';

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getMyProfile().subscribe(user => {
      this.currentUserEmail = user.email;
    });
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  toggleStatus(user: any) {
    const newStatus = !user.active;
    this.http.put(`${this.apiUrl}/${user.id}/status?active=${newStatus}`, {}, { withCredentials: true }).subscribe({
      next: () => {
        user.active = newStatus;
      },
      error: (err) => alert('Error updating status: ' + err.message)
    });
  }

  createAdmin() {
    this.http.post(`${this.apiUrl}/admin`, this.newAdmin, { withCredentials: true }).subscribe({
      next: () => {
        alert('Admin created successfully!');
        this.showAdminForm = false;
        this.newAdmin = { name: '', email: '', password: '', phone: '' };
        this.loadUsers();
      },
      error: (err) => alert('Error creating admin: ' + err.message)
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user and all their data permanently? This cannot be undone.')) {
      this.http.delete(`${this.apiUrl}/${userId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          alert('User deleted permanently.');
        },
        error: (err) => alert('Error deleting user: ' + err.message)
      });
    }
  }
}
