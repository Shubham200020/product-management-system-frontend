import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  sellingPrice: number;
}

export interface SaleRequest {
  shopId: number;
  paymentMode: string;
  items: SaleItemRequest[];
}

export interface SalesItemResponse {
  id: number;
  product: any;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  profit: number;
}

export interface SalesInvoice {
  id: number;
  totalAmount: number;
  totalProfit: number;
  paymentMode: string;
  createdAt: string;
  shop: any;
  salesItems: SalesItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://localhost:8080/api/sales';

  constructor(private http: HttpClient) {}

  getSales(): Observable<SalesInvoice[]> {
    return this.http.get<SalesInvoice[]>(this.apiUrl, { withCredentials: true });
  }

  createSale(request: SaleRequest): Observable<SalesInvoice> {
    return this.http.post<SalesInvoice>(`${this.apiUrl}/create`, request, { withCredentials: true });
  }
}
