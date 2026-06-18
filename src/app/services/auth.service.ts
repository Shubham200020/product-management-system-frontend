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

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  clearLocalSession(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('user-info');
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        if (res && res.name && res.role && this.isBrowser()) {
          const userInfo = encodeURIComponent(`${res.name}:${res.role}`);
          localStorage.setItem('user-info', userInfo);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearLocalSession();
        this.router.navigate(['/login']);
      })
    );
  }

  isAuthenticated(): boolean {
    const userInfo = this.getCookie('user-info');
    if (userInfo) return true;

    if (this.isBrowser()) {
      return !!localStorage.getItem('user-info');
    }
    return false;
  }

  getUserName(): string {
    let userInfo = this.getCookie('user-info');
    if (!userInfo && this.isBrowser()) {
      userInfo = localStorage.getItem('user-info');
    }
    if (userInfo) {
      const decoded = decodeURIComponent(userInfo).replace(/\+/g, ' ');
      return decoded.split(':')[0];
    }
    return '';
  }

  getRole(): string {
    let userInfo = this.getCookie('user-info');
    if (!userInfo && this.isBrowser()) {
      userInfo = localStorage.getItem('user-info');
    }
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
