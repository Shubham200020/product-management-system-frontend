import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profit-report',
  standalone: true,
  imports: [CommonModule, InrPipe, FormsModule],
  templateUrl: './profit-report.component.html',
  styleUrls: ['./profit-report.component.css']
})
export class ProfitReportComponent implements OnInit {
  batches: any[] = [];
  filteredBatches: any[] = [];
  categories: Category[] = [];
  shops: Shop[] = [];
  
  selectedCategory: string = '';
  selectedShop: string = '';
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  
  loading = true;

  totalGrossProfit = 0;
  totalNetProfit = 0;
  totalInvestment = 0;
  totalPotentialLoss = 0;

  // View modes
  viewMode: 'table' | 'bar' | 'pie' = 'table';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.productService.getInventoryReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.batches = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading report', err);
        this.loading = false;
      }
    });

    this.categoryService.getCategories().subscribe(data => this.categories = data);
    this.shopService.getShops().subscribe(data => this.shops = data);
  }

  applyFilters() {
    const search = (this.searchTerm || '').toLowerCase().trim();
    this.filteredBatches = this.batches.filter(b => {
      const matchCategory = !this.selectedCategory || b.categoryName === this.selectedCategory;
      const matchShop = !this.selectedShop || b.shopName === this.selectedShop;
      const matchSearch = !search || b.productName.toLowerCase().includes(search) || b.productSku.toLowerCase().includes(search);
      return matchCategory && matchShop && matchSearch;
    });

    this.calculateTotals();
  }

  calculateTotals() {
    this.totalGrossProfit = this.filteredBatches.reduce((sum, b) => sum + (b.grossProfit || 0), 0);
    this.totalNetProfit = this.filteredBatches.reduce((sum, b) => sum + (b.netProfit || 0), 0);
    this.totalInvestment = this.filteredBatches.reduce((sum, b) => sum + (b.investment || 0), 0);
    this.totalPotentialLoss = this.filteredBatches.reduce((sum, b) => sum + (b.potentialLoss || 0), 0);
  }

  setViewMode(mode: 'table' | 'bar' | 'pie') {
    this.viewMode = mode;
  }

  get topProductsByProfit() {
    const map = new Map<string, { netProfit: number; grossProfit: number }>();
    
    this.filteredBatches.forEach(b => {
      const name = b.productName || 'Unknown';
      const existing = map.get(name) || { netProfit: 0, grossProfit: 0 };
      map.set(name, {
        netProfit: existing.netProfit + (b.netProfit || 0),
        grossProfit: existing.grossProfit + (b.grossProfit || 0)
      });
    });
    
    const list = Array.from(map.entries()).map(([name, stats]) => ({
      name,
      netProfit: stats.netProfit,
      grossProfit: stats.grossProfit
    }));
    
    // Sort by Net Profit descending
    list.sort((a, b) => b.netProfit - a.netProfit);
    
    const topList = list.slice(0, 10);
    const maxProfit = topList.reduce((max, item) => item.netProfit > max ? item.netProfit : max, 1);
    
    return topList.map(item => ({
      ...item,
      percentage: Math.max(0, Math.round((item.netProfit / maxProfit) * 100))
    }));
  }

  get profitByCategory() {
    const map = new Map<string, number>();
    
    this.filteredBatches.forEach(b => {
      const name = b.categoryName || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + (b.netProfit || 0));
    });
    
    const list = Array.from(map.entries()).map(([name, profit]) => ({
      name,
      profit: Math.max(0, profit) // Only positive profits for pie chart
    }));
    
    const totalProfit = list.reduce((sum, item) => sum + item.profit, 0);
    if (totalProfit === 0) return [];
    
    let accumulated = 0;
    const slices = list.map((item, index) => {
      const percentage = Math.round((item.profit / totalProfit) * 100);
      const start = accumulated;
      accumulated += percentage;
      const end = index === list.length - 1 ? 100 : accumulated;
      return {
        name: item.name,
        profit: item.profit,
        percentage,
        color: this.getChartColor(index),
        start,
        end
      };
    });
    
    return slices;
  }

  get categoryPieGradient(): string {
    const slices = this.profitByCategory;
    if (slices.length === 0) return 'rgba(255, 255, 255, 0.05)';
    const parts = slices.map(s => `${s.color} ${s.start}% ${s.end}%`);
    return `conic-gradient(${parts.join(', ')})`;
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
}
