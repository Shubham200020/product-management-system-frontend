import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { ShopService, Shop } from '../../services/shop.service';
import { ProductService, Product } from '../../services/product.service';
import { InrPipe } from '../../pipes/inr.pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  shops: Shop[] = [];
  loading = true;
  showForm = false;
  isEditing = false;
  currentCategory: Category = this.resetCategory();

  // Product List in Category
  selectedCategory: Category | null = null;
  productsInCategory: Product[] = [];
  loadingProducts = false;
  
  // Summary Stats
  categoryStats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  };

  constructor(
    private categoryService: CategoryService,
    private shopService: ShopService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadShops();
  }

  resetCategory(): Category {
    return { name: '', shop: null };
  }

  loadShops() {
    this.shopService.getShops().subscribe(data => this.shops = data);
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching categories', err);
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.isEditing = false;
      this.currentCategory = this.resetCategory();
    }
  }

  editCategory(category: Category) {
    this.currentCategory = { ...category };
    this.isEditing = true;
    this.showForm = true;
  }

  deleteCategory(id: number | undefined) {
    if (id && confirm('Are you sure you want to delete this category? This might affect products associated with it.')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  viewProducts(category: Category) {
    if (!category.id) return;
    this.selectedCategory = category;
    this.loadingProducts = true;
    this.productService.getProductsByCategory(category.id).subscribe({
      next: (products) => {
        this.productsInCategory = products;
        this.calculateStats();
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error fetching products for category', err);
        this.loadingProducts = false;
      }
    });
  }

  calculateStats() {
    this.categoryStats = {
      total: this.productsInCategory.length,
      lowStock: this.productsInCategory.filter(p => p.stockStatus === 'LOW_STOCK').length,
      outOfStock: this.productsInCategory.filter(p => p.stockStatus === 'OUT_OF_STOCK').length,
      totalValue: this.productsInCategory.reduce((sum, p) => sum + (p.mrp * (p.availableStock || 0)), 0)
    };
  }

  closeProductList() {
    this.selectedCategory = null;
    this.productsInCategory = [];
  }

  onSubmit() {
    if (this.isEditing && this.currentCategory.id) {
      this.categoryService.updateCategory(this.currentCategory.id, this.currentCategory).subscribe(() => {
        this.loadCategories();
        this.toggleForm();
      });
    } else {
      this.categoryService.createCategory(this.currentCategory).subscribe(() => {
        this.loadCategories();
        this.toggleForm();
      });
    }
  }
}
