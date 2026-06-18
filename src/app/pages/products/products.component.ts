import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  allCategories: Category[] = [];
  shops: Shop[] = [];
  loading = true;
  showForm = false;
  isEditing = false;
  
  currentProduct: Product = this.resetProduct();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadMetadata();
  }

  resetProduct(): Product {
    return {
      name: '',
      brand: '',
      type: 'PERISHABLE',
      isActive: true,
      category: null,
      shop: null,
      mrp: 0
    };
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
      }
    });
  }

  loadMetadata() {
    this.categoryService.getCategories().subscribe(data => {
      this.allCategories = data;
      this.onShopChange();
    });
    this.shopService.getShops().subscribe(data => this.shops = data);
  }

  onShopChange() {
    if (this.currentProduct.shop) {
      this.categories = this.allCategories.filter(cat => cat.shop && cat.shop.id === this.currentProduct.shop.id);
      if (this.currentProduct.category && this.currentProduct.category.shop && this.currentProduct.category.shop.id !== this.currentProduct.shop.id) {
        this.currentProduct.category = null;
      }
    } else {
      this.categories = [];
      this.currentProduct.category = null;
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.isEditing = false;
      this.currentProduct = this.resetProduct();
      this.categories = [];
    }
  }

  editProduct(product: Product) {
    this.currentProduct = { ...product };
    this.isEditing = true;
    this.showForm = true;
    this.onShopChange();
  }

  deleteProduct(id: number | undefined) {
    if (id && confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  onSubmit() {
    if (this.isEditing && this.currentProduct.id) {
      this.productService.updateProduct(this.currentProduct.id, this.currentProduct).subscribe(() => {
        this.loadProducts();
        this.toggleForm();
      });
    } else {
      this.productService.createProduct(this.currentProduct).subscribe(() => {
        this.loadProducts();
        this.toggleForm();
      });
    }
  }
}
