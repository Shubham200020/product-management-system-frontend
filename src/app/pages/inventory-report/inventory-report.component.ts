import { Component, OnInit } from '@angular/core';
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
  searchTerm: string = '';
  
  loading = true;
  today = new Date();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  compareDates(d1: any, d2: Date): boolean {
    if (!d1) return false;
    const date1 = new Date(d1);
    return date1 < d2;
  }

  loadData() {
    this.loading = true;
    forkJoin({
      report: this.productService.getInventoryReport(),
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
      const matchSearch = !search || b.productName.toLowerCase().includes(search) || b.productSku.toLowerCase().includes(search);
      return matchCategory && matchShop && matchSearch;
    });
  }

  calculateProductProfit(product: any): number {
    if (!product.salesItems) return 0;
    return product.salesItems.reduce((sum: number, item: any) => sum + (item.profit || 0), 0);
  }
}
