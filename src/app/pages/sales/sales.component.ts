import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService, SaleRequest, SaleItemRequest, SalesInvoice } from '../../services/sales.service';
import { ProductService, Product } from '../../services/product.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  shops: Shop[] = [];
  selectedShop: Shop | null = null;
  paymentMode: string = 'CASH';
  cart: any[] = [];
  
  salesHistory: SalesInvoice[] = [];
  activeTab: 'new' | 'history' = 'history';
  
  loading = true;
  loadingProducts = true;
  submitting = false;
  expandedSaleId: number | null = null;

  constructor(
    private salesService: SalesService,
    private productService: ProductService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applySearch();
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.loadingProducts = false;
      }
    });

    this.shopService.getShops().subscribe(data => {
      this.shops = data;
    });
    this.loadSalesHistory();
  }

  applySearch() {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p => 
      !search || 
      p.name.toLowerCase().includes(search) || 
      (p.sku && p.sku.toLowerCase().includes(search))
    );
  }

  loadSalesHistory() {
    this.loading = true;
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.salesHistory = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales history', err);
        this.loading = false;
      }
    });
  }

  switchTab(tab: 'new' | 'history') {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadSalesHistory();
    }
  }

  addToCart(product: Product) {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
      this.calculatePrice(existing);
    } else {
      const newItem = { 
        product, 
        quantity: 1, 
        mrp: product.mrp || 0,
        discount: product.nextBatchDiscount || 0,
        price: product.mrp || 0 
      };
      this.calculatePrice(newItem);
      this.cart.push(newItem);
    }
  }

  calculatePrice(item: any) {
    if (item.mrp && item.discount !== undefined) {
      item.price = item.mrp - (item.mrp * item.discount / 100);
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  submitSale() {
    if (!this.selectedShop || this.cart.length === 0) return;

    this.submitting = true;
    const request: SaleRequest = {
      shopId: this.selectedShop.id!,
      paymentMode: this.paymentMode,
      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        sellingPrice: item.price
      }))
    };

    this.salesService.createSale(request).subscribe({
      next: () => {
        alert('Sale created successfully!');
        this.cart = [];
        this.submitting = false;
        this.switchTab('history');
      },
      error: (err) => {
        console.error('Error creating sale', err);
        const errorMsg = err.error?.message || err.error || 'Failed to create sale';
        alert('Error: ' + errorMsg);
        this.submitting = false;
      }
    });
  }

  getTotalQuantity(sale: SalesInvoice): number {
    if (!sale.salesItems) return 0;
    return sale.salesItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  toggleDetails(saleId: number | undefined) {
    if (!saleId) return;
    this.expandedSaleId = this.expandedSaleId === saleId ? null : saleId;
  }
}
