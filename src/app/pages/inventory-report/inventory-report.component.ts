import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, InrPipe, FormsModule],
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.css']
})
export class InventoryReportComponent implements OnInit {
  batches: any[] = [];
  filteredBatches: any[] = [];
  categories: Category[] = [];
  shops: Shop[] = [];
  
  selectedCategory: string = '';
  selectedShop: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  
  loading = true;
  today = new Date();

  totalGrossProfit = 0;
  totalNetProfit = 0;
  totalInvestment = 0;
  totalPotentialLoss = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shopService: ShopService,
    private route: ActivatedRoute
  ) {}
  
  Math = Math;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.selectedStatus = params['status'];
      }
      this.loadData();
    });
  }

  compareDates(d1: any, d2: Date): boolean {
    if (!d1) return false;
    const date1 = new Date(d1);
    return date1 < d2;
  }

  loadData() {
    this.loading = true;
    forkJoin({
      report: this.productService.getInventoryReport(this.startDate, this.endDate, this.selectedStatus),
      categories: this.categoryService.getCategories(),
      shops: this.shopService.getShops()
    }).subscribe({
      next: ({ report, categories, shops }) => {
        this.batches = report;
        this.categories = categories;
        this.shops = shops;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading report data', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const search = (this.searchTerm || '').toLowerCase().trim();
    this.filteredBatches = this.batches.filter(b => {
      const matchCategory = !this.selectedCategory || b.categoryName === this.selectedCategory;
      const matchShop = !this.selectedShop || b.shopName === this.selectedShop;
      
      // If no specific status is selected, show everything EXCEPT Out of Stock
      let matchStatus = false;
      if (this.selectedStatus === 'SHOW_ALL') {
        matchStatus = true;
      } else if (this.selectedStatus === 'EXPIRED') {
        matchStatus = b.stockStatus === 'EXPIRED' || b.stockStatus === 'NEAR_EXPIRY';
      } else if (this.selectedStatus) {
        matchStatus = b.stockStatus === this.selectedStatus;
      } else {
        matchStatus = b.stockStatus !== 'OUT_OF_STOCK';
      }
      
      const matchSearch = !search || b.productName.toLowerCase().includes(search) || b.productSku.toLowerCase().includes(search);
      return matchCategory && matchShop && matchStatus && matchSearch;
    });

    // Smart Sorting Logic
    this.filteredBatches.sort((a, b) => {
      // 1. Primary: Expiry Date (Ascending - soonest expiry first)
      const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      
      if (dateA !== dateB) return dateA - dateB;

      // 2. Secondary: If no expiry or same date, sort by loss (Descending)
      const lossA = a.potentialLoss || 0;
      const lossB = b.potentialLoss || 0;
      return lossB - lossA;
    });

    // Calculate Days Left for UI
    this.filteredBatches.forEach(b => {
      if (b.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(b.expiryDate);
        expiry.setHours(0, 0, 0, 0);
          
        const diffTime = expiry.getTime() - today.getTime();
        // Use Math.round to avoid floating point issues and accurately detect same day (0)
        b.daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
      } else {
        b.daysLeft = null;
      }
    });

    this.calculateTotals();
  }

  calculateTotals() {
    this.totalGrossProfit = this.filteredBatches.reduce((sum, b) => sum + (b.grossProfit || 0), 0);
    this.totalNetProfit = this.filteredBatches.reduce((sum, b) => sum + (b.netProfit || 0), 0);
    this.totalInvestment = this.filteredBatches.reduce((sum, b) => sum + (b.investment || 0), 0);
    this.totalPotentialLoss = this.filteredBatches.reduce((sum, b) => sum + (b.potentialLoss || 0), 0);
  }

  calculateProductProfit(product: any): number {
    if (!product.salesItems) return 0;
    return product.salesItems.reduce((sum: number, item: any) => sum + (item.profit || 0), 0);
  }
}
