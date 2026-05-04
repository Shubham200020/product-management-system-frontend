import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shop {
  id?: number;
  name: string;
  city: string;
  address: string;
  gstNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = 'http://localhost:8080/api/shops';

  constructor(private http: HttpClient) {}

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl, { withCredentials: true });
  }

  createShop(shop: Shop): Observable<Shop> {
    return this.http.post<Shop>(this.apiUrl, shop, { withCredentials: true });
  }
}
