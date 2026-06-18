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

  // Filters and View Modes for Sales History
  historyViewMode: 'list' | 'bar' | 'pie' | 'trend' = 'list';
  filterProductName: string = '';
  filterDate: string = '';

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
        // Sort latest sales first
        this.salesHistory = (data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales history', err);
        this.loading = false;
      }
    });
  }

  setHistoryViewMode(mode: 'list' | 'bar' | 'pie' | 'trend') {
    this.historyViewMode = mode;
  }

  setFilterToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.filterDate = `${yyyy}-${mm}-${dd}`;
  }

  clearFilters() {
    this.filterProductName = '';
    this.filterDate = '';
  }

  get todaysSalesCount(): number {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    return this.salesHistory.filter(s => {
      const saleDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
      return saleDate === todayStr;
    }).length;
  }

  get todaysSalesAmount(): number {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    return this.salesHistory
      .filter(s => {
        const saleDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
        return saleDate === todayStr;
      })
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  get filteredSalesHistory(): SalesInvoice[] {
    return this.salesHistory.filter(sale => {
      const searchProd = this.filterProductName.toLowerCase().trim();
      const matchesProduct = !searchProd || (sale.salesItems && sale.salesItems.some(item => 
        item.product?.name?.toLowerCase().includes(searchProd)
      ));

      let matchesDate = true;
      if (this.filterDate) {
        const saleDate = sale.createdAt ? sale.createdAt.substring(0, 10) : '';
        matchesDate = (saleDate === this.filterDate);
      }

      return matchesProduct && matchesDate;
    });
  }

  get topSellingProducts() {
    const productSalesMap = new Map<string, { quantity: number; revenue: number }>();
    
    this.salesHistory.forEach(sale => {
      if (sale.salesItems) {
        sale.salesItems.forEach(item => {
          const name = item.product?.name || 'Unknown Product';
          const qty = item.quantity || 0;
          const rev = (item.sellingPrice || 0) * qty;
          
          const existing = productSalesMap.get(name) || { quantity: 0, revenue: 0 };
          productSalesMap.set(name, {
            quantity: existing.quantity + qty,
            revenue: existing.revenue + rev
          });
        });
      }
    });
    
    const productSalesArray = Array.from(productSalesMap.entries()).map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: stats.revenue
    }));
    
    productSalesArray.sort((a, b) => b.quantity - a.quantity);
    const topProducts = productSalesArray.slice(0, 10);
    const maxQty = topProducts.reduce((max, p) => p.quantity > max ? p.quantity : max, 1);
    
    return topProducts.map(p => ({
      ...p,
      percentage: Math.round((p.quantity / maxQty) * 100)
    }));
  }

  getChartColor(index: number): string {
    const colors = [
      '#10b981', // emerald
      '#6366f1', // indigo
      '#ec4899', // pink
      '#f59e0b', // amber
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ef4444', // red
      '#14b8a6', // teal
      '#f97316', // orange
      '#06b6d4'  // cyan
    ];
    return colors[index % colors.length];
  }

  get pieChartSlices() {
    const topProducts = this.topSellingProducts;
    const totalQty = topProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    if (totalQty === 0) return [];
    
    let accumulated = 0;
    return topProducts.map((p, index) => {
      const percentage = Math.round((p.quantity / totalQty) * 100);
      const start = accumulated;
      accumulated += percentage;
      const end = index === topProducts.length - 1 ? 100 : accumulated;
      
      return {
        name: p.name,
        quantity: p.quantity,
        percentage,
        color: this.getChartColor(index),
        start,
        end
      };
    });
  }

  get pieChartGradient(): string {
    const slices = this.pieChartSlices;
    if (slices.length === 0) return 'rgba(255, 255, 255, 0.05)';
    
    const parts = slices.map(s => `${s.color} ${s.start}% ${s.end}%`);
    return `conic-gradient(${parts.join(', ')})`;
  }

  get totalQtySold(): number {
    return this.topSellingProducts.reduce((sum, p) => sum + p.quantity, 0);
  }

  get profitTrendData() {
    const profitMap = new Map<string, number>();
    
    this.salesHistory.forEach(sale => {
      const dateStr = sale.createdAt ? sale.createdAt.substring(0, 10) : 'Unknown';
      const profit = sale.totalProfit || 0;
      profitMap.set(dateStr, (profitMap.get(dateStr) || 0) + profit);
    });
    
    const profitArray = Array.from(profitMap.entries()).map(([date, profit]) => ({
      date,
      formattedDate: this.formatDateLabel(date),
      profit
    }));
    
    // Sort chronologically (oldest first)
    profitArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const maxProfit = profitArray.reduce((max, p) => p.profit > max ? p.profit : max, 1);
    
    return profitArray.map(p => ({
      ...p,
      percentage: Math.max(5, Math.round((p.profit / maxProfit) * 100))
    }));
  }

  formatDateLabel(dateStr: string): string {
    if (dateStr === 'Unknown') return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
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
