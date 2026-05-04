import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isSidebarOpen = false;
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userService.getMyProfile().subscribe({
      next: (user) => this.currentUser = user,
      error: (err) => console.error('Error loading dashboard profile', err)
    });
  }

  get username() {
    return this.authService.getUserName();
  }

  get role() {
    return this.authService.getRole();
  }

  get isAdmin() {
    return this.role === 'ADMIN';
  }

  get isShopkeeper() {
    return this.role === 'SHOPKEEPER';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
