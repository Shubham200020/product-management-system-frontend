import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PurchaseItemRequest {
  productId: number;
  quantity: number;
  costPrice: number;
  expiryDate?: string;
}

export interface PurchaseRequest {
  shopId: number;
  supplier: string;
  items: PurchaseItemRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = 'http://localhost:8080/api/purchases';

  constructor(private http: HttpClient) {}

  getPurchases(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }

  createPurchase(request: PurchaseRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, request, { withCredentials: true });
  }
}
