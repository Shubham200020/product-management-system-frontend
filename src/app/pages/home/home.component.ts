import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  gradient: string;
  bgGradient: string;
}

import { ProductService } from '../../services/product.service';
import { SalesService } from '../../services/sales.service';
import { StatusService, SystemStatus } from '../../services/status.service';
import { forkJoin, Observable } from 'rxjs';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  stats: StatCard[] = [
    {
      title: 'Total Products',
      value: '...',
      change: 'Loading...',
      icon: '📦',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)'
    },
    {
      title: 'Total Stock Left',
      value: '...',
      change: 'Loading...',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)'
    },
    {
      title: 'Total Sales',
      value: '...',
      change: 'Loading...',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(190, 24, 93, 0.05) 100%)'
    },
    {
      title: 'Total Profit',
      value: '...',
      change: 'Loading...',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)'
    },
    {
      title: 'Low Stock Alert',
      value: '...',
      change: 'Loading...',
      icon: '⚠️',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)'
    },
    {
      title: 'Out of Stock',
      value: '...',
      change: 'Loading...',
      icon: '🚫',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)'
    }
  ];
  loading = true;
  systemStatus$!: Observable<SystemStatus>;

  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private statusService: StatusService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.systemStatus$ = this.statusService.getStatus();
  }

  loadStats() {
    this.loading = true;
    
    // Load Products
    this.productService.getProducts().subscribe({
      next: (products) => {
        const safeProducts = products || [];
        const totalStock = safeProducts.reduce((sum, p) => sum + (p.availableStock || 0), 0);
        const lowStockCount = safeProducts.filter(p => p.stockStatus === 'LOW_STOCK').length;
        const outOfStockCount = safeProducts.filter(p => p.stockStatus === 'OUT_OF_STOCK').length;

        this.stats[0].value = safeProducts.length.toString();
        this.stats[0].change = 'Distinct products cataloged';
        
        this.stats[1].value = totalStock.toLocaleString();
        this.stats[1].change = 'Total units in warehouse';
        
        this.stats[4].value = lowStockCount.toString();
        this.stats[4].change = 'Products needing restock';

        this.stats[5].value = outOfStockCount.toString();
        this.stats[5].change = 'Zero inventory products';
        
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.checkLoadingComplete();
      }
    });

    // Load Sales
    this.salesService.getSales().subscribe({
      next: (sales) => {
        const safeSales = sales || [];
        const totalProfit = safeSales.reduce((sum, s) => sum + (s.totalProfit || 0), 0);
        const totalSalesAmount = safeSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        this.stats[2].value = totalSalesAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
        this.stats[2].change = 'Total revenue';
        
        this.stats[3].value = totalProfit.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
        this.stats[3].change = 'Cumulative earnings';
        
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading sales', err);
        this.checkLoadingComplete();
      }
    });
  }

  private completedRequests = 0;
  private checkLoadingComplete() {
    this.completedRequests++;
    if (this.completedRequests >= 2) {
      this.loading = false;
    }
  }
}
