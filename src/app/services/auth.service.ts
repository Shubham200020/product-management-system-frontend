import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        // Clear local session info if any
        this.router.navigate(['/login']);
      })
    );
  }

  isAuthenticated(): boolean {
    const userInfo = this.getCookie('user-info');
    return !!userInfo;
  }

  getUserName(): string {
    const userInfo = this.getCookie('user-info');
    if (userInfo) {
      const decoded = decodeURIComponent(userInfo).replace(/\+/g, ' ');
      return decoded.split(':')[0];
    }
    return '';
  }

  getRole(): string {
    const userInfo = this.getCookie('user-info');
    if (userInfo) {
      const decoded = decodeURIComponent(userInfo).replace(/\+/g, ' ');
      return decoded.split(':')[1];
    }
    return '';
  }

  private getCookie(name: string): string | null {
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=`;
      })
      .map(cookie => {
        return cookie.substring(nameLenPlus);
      })[0] || null;
  }
}
