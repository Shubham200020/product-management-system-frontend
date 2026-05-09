import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService, PurchaseRequest, PurchaseItemRequest } from '../../services/purchase.service';
import { ProductService, Product } from '../../services/product.service';
import { ShopService, Shop } from '../../services/shop.service';
import { InrPipe } from '../../pipes/inr.pipe';
import { ActivatedRoute } from '@angular/router';

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
    private shopService: ShopService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadPurchases();
    this.checkRestockParameter();
  }

  checkRestockParameter() {
    this.route.queryParams.subscribe(params => {
      const restockId = params['restockProductId'];
      if (restockId) {
        this.showForm = true;
        this.addItem();
        const lastIndex = this.currentPurchase.items.length - 1;
        this.currentPurchase.items[lastIndex].productId = +restockId;
        setTimeout(() => this.onProductChange(lastIndex), 500);
      }
    });
  }

  clearExpired(index: number) {
    const item = this.currentPurchase.items[index];
    const product = this.getProductById(item.productId);
    if (product && product.id && confirm(`Are you sure you want to discard all expired stock for ${product.name}?`)) {
      this.productService.clearExpiredStock(product.id).subscribe({
        next: () => {
          alert('Expired stock cleared!');
          this.loadData(); // Refresh stock counts
        }
      });
    }
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
        // Sort by date: Newest first
        this.purchases = data.sort((a, b) => {
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        });
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
      costPrice: 0,
      mrp: 0
    });
  }

  onProductChange(index: number) {
    const item = this.currentPurchase.items[index];
    const product = this.getProductById(item.productId);
    if (product) {
      item.mrp = product.mrp;
    }
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

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductNames(purchase: any): string {
    if (!purchase.inventoryBatches || purchase.inventoryBatches.length === 0) return 'No products';
    
    const names = purchase.inventoryBatches
      .map((batch: any) => batch.product?.name)
      .filter((name: any) => !!name);
    
    const uniqueNames = Array.from(new Set(names));
    
    if (uniqueNames.length <= 2) return uniqueNames.join(', ');
    return `${uniqueNames[0]}, ${uniqueNames[1]} (+${uniqueNames.length - 2} more)`;
  }
}
