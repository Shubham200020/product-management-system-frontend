import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css']
})
export class InsightsComponent implements OnInit, OnDestroy {
  activeTab: 'restock' | 'discounts' = 'restock';
  restockData: any[] = [];
  discountData: any[] = [];
  loading = true;
  stockHealthSummary: any = null;
  private pollingSub?: Subscription;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  purchaseRestock(item: any) {
    this.router.navigate(['/dashboard/purchases'], { 
      queryParams: { restockProductId: item.productId } 
    });
  }

  ngOnInit() {
    this.startRealTimeProcessing();
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  startRealTimeProcessing() {
    this.pollingSub = interval(10000) // 10 seconds
      .pipe(startWith(0))
      .subscribe(() => {
        this.loadAllData(false);
        this.loadHealthSummary();
      });
  }

  loadHealthSummary() {
    this.productService.getStockHealthSummary().subscribe({
      next: (data) => this.stockHealthSummary = data,
      error: (err) => console.error('Error loading health summary', err)
    });
  }

  loadAllData(showLoader: boolean = true) {
    if (showLoader) this.loading = true;
    // Sequential load for simplicity, or use forkJoin for parallel
    this.productService.getRestockRecommendations().subscribe({
      next: (res) => {
        this.restockData = res;
        this.loadDiscounts();
      },
      error: (err) => {
        console.error('Restock load fail', err);
        this.loadDiscounts();
      }
    });
  }

  loadDiscounts() {
    this.productService.getDiscountRecommendations().subscribe({
      next: (res) => {
        this.discountData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Discount load fail', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: 'restock' | 'discounts') {
    this.activeTab = tab;
  }

  getUrgencyClass(urgency: string) {
    return urgency.toLowerCase();
  }

  getRiskColor(score: number): string {
    if (score >= 70) return '#ff4d4d';
    if (score >= 40) return '#ffa500';
    return '#4caf50';
  }

  applySmartDiscount(item: any) {
    if (item.isExpired) return;

    if (confirm(`Apply ${item.recommendedDiscount}% discount to this specific batch of ${item.productName}? This will NOT affect other fresh batches of this product.`)) {
      this.productService.applyBatchDiscount(item.batchId, item.recommendedDiscount).subscribe({
        next: () => {
          alert(`Batch discount applied! This batch is now marked for clearance.`);
          this.loadAllData(false);
        },
        error: (err) => {
          console.error('Apply batch discount fail', err);
          alert('Failed to apply discount. Please try again.');
        }
      });
    }
  }
}
