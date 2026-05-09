import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  sku?: string;
  brand: string;
  type: string;
  isActive: boolean;
  category?: any;
  shop?: any;
  availableStock?: number;
  totalInitialStock?: number;
  stockPercentage?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'PARTIALLY_EXPIRED';
  investment?: number;
  potentialLoss?: number;
  mrp: number;
  recommendedDiscount?: number;
  expiredStock?: number;
  freshStock?: number;
  nearExpiryStock?: number;
  nextBatchDiscount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { withCredentials: true });
  }

  getInventoryReport(startDate?: string, endDate?: string, status?: string): Observable<any[]> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status) params.status = status;
    return this.http.get<any[]>(`${this.apiUrl}/report`, { params, withCredentials: true });
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, { withCredentials: true });
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { withCredentials: true });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`, { withCredentials: true });
  }

  getRestockRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/recommendations/restock`, { withCredentials: true });
  }

  getDiscountRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/recommendations/discounts`, { withCredentials: true });
  }

  getStockHealthSummary(): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/recommendations/summary`, { withCredentials: true });
  }

  applyDiscount(productId: number, discountPercent: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/apply-discount`, null, {
      params: { discountPercent: discountPercent.toString() },
      withCredentials: true
    });
  }

  applyBatchDiscount(batchId: number, discountPercent: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/batch/${batchId}/apply-discount`, null, {
      params: { discountPercent: discountPercent.toString() },
      withCredentials: true
    });
  }

  clearExpiredStock(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/clear-expired`, null, { withCredentials: true });
  }
}
