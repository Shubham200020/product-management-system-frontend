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
  
  loading = true;

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
    this.productService.getInventoryReport().subscribe({
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
  }
}
