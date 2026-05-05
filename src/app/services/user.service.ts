import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  updateMyProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, user, { withCredentials: true });
  }

  checkEmailAvailability(email: string, excludeId?: number): Observable<boolean> {
    const params: any = { email };
    if (excludeId) params.excludeId = excludeId;
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params, withCredentials: true });
  }

  checkPhoneAvailability(phone: string, excludeId?: number): Observable<boolean> {
    const params: any = { phone };
    if (excludeId) params.excludeId = excludeId;
    return this.http.get<boolean>(`${this.apiUrl}/check-phone`, { params, withCredentials: true });
  }
}
