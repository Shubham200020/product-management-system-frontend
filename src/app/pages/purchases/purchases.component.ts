import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService, PurchaseRequest, PurchaseItemRequest } from '../../services/purchase.service';
import { ProductService, Product } from '../../services/product.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
  products: Product[] = [];
  shops: Shop[] = [];
  purchases: any[] = [];
  
  loading = true;
  showForm = false;
  submitting = false;
  
  currentPurchase: PurchaseRequest = this.resetPurchase();

  constructor(
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadPurchases();
  }

  resetPurchase(): PurchaseRequest {
    return {
      shopId: 0,
      supplier: '',
      items: []
    };
  }

  loadData() {
    this.productService.getProducts().subscribe(data => this.products = data);
    this.shopService.getShops().subscribe(data => this.shops = data);
  }

  loadPurchases() {
    this.loading = true;
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching purchases', err);
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.currentPurchase = this.resetPurchase();
    }
  }

  addItem() {
    this.currentPurchase.items.push({
      productId: 0,
      quantity: 1,
      costPrice: 0
    });
  }

  removeItem(index: number) {
    this.currentPurchase.items.splice(index, 1);
  }

  onSubmit() {
    if (this.currentPurchase.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    this.submitting = true;
    this.purchaseService.createPurchase(this.currentPurchase).subscribe({
      next: () => {
        alert('Purchase created successfully! Stock updated.');
        this.loadPurchases();
        this.toggleForm();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error creating purchase', err);
        const errorMsg = err.error?.message || err.error || 'Failed to create purchase';
        alert('Error: ' + errorMsg);
        this.submitting = false;
      }
    });
  }
}
