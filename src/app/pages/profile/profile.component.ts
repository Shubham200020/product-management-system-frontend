import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User = {
    name: '',
    email: '',
    phone: '',
    role: ''
  };
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  emailAvailable = true;
  phoneAvailable = true;
  checkingEmail = false;
  checkingPhone = false;

  // New fields for enhanced UX
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  activeSection: 'general' | 'security' | 'appearance' = 'general';

  private emailSubject = new Subject<string>();
  private phoneSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadProfile();

    this.emailSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(email => {
      if (email && email !== this.originalEmail) {
        this.checkingEmail = true;
        this.userService.checkEmailAvailability(email, this.user.id).subscribe({
          next: (taken) => {
            this.emailAvailable = !taken;
            this.checkingEmail = false;
          },
          error: () => this.checkingEmail = false
        });
      } else {
        this.emailAvailable = true;
      }
    });

    this.phoneSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(phone => {
      if (phone && phone.length === 10 && phone !== this.originalPhone) {
        this.checkingPhone = true;
        this.userService.checkPhoneAvailability(phone, this.user.id).subscribe({
          next: (taken) => {
            this.phoneAvailable = !taken;
            this.checkingPhone = false;
          },
          error: () => this.checkingPhone = false
        });
      } else {
        this.phoneAvailable = true;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public originalEmail = '';
  public originalPhone = '';

  loadProfile() {
    this.loading = true;
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.originalEmail = data.email;
        this.originalPhone = data.phone;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.errorMessage = 'Failed to load profile data.';
        this.loading = false;
      }
    });
  }

  onEmailChange(email: string) {
    this.emailSubject.next(email ? email.trim().toLowerCase() : '');
  }

  onPhoneChange(phone: string) {
    this.phoneSubject.next(phone);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.user.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.emailAvailable || !this.phoneAvailable) {
      this.errorMessage = 'Please resolve the availability issues before saving.';
      return;
    }

    if (this.user.password && this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const userToSubmit = {
      ...this.user,
      email: this.user.email ? this.user.email.trim().toLowerCase() : ''
    };

    this.userService.updateMyProfile(userToSubmit).subscribe({
      next: (updatedUser) => {
        this.user = { ...updatedUser, password: '' }; // Clear password field
        this.confirmPassword = ''; // Clear confirm password
        this.originalEmail = updatedUser.email;
        this.originalPhone = updatedUser.phone;
        this.successMessage = 'Profile updated successfully!';
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        this.saving = false;
      }
    });
  }
}
