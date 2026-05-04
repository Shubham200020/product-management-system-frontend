import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  shops: Shop[] = [];
  loading = true;
  showForm = false;
  currentCategory: Category = { name: '', shop: null };

  constructor(
    private categoryService: CategoryService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadShops();
  }

  loadShops() {
    this.shopService.getShops().subscribe(data => this.shops = data);
  }

  loadCategories() {
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
      this.currentCategory = { name: '', shop: null };
    }
  }

  onSubmit() {
    this.categoryService.createCategory(this.currentCategory).subscribe(() => {
      this.loadCategories();
      this.toggleForm();
    });
  }
}
