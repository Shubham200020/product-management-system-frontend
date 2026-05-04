import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.css']
})
export class ShopsComponent implements OnInit {
  shops: Shop[] = [];
  loading = true;
  showForm = false;
  currentShop: Shop = { name: '', city: '', address: '', gstNumber: '' };

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.shopService.getShops().subscribe({
      next: (data) => {
        this.shops = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching shops', err);
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.currentShop = { name: '', city: '', address: '', gstNumber: '' };
    }
  }

  onSubmit() {
    this.shopService.createShop(this.currentShop).subscribe({
      next: () => {
        this.loadShops();
        this.toggleForm();
      },
      error: (err) => {
        console.error('Error creating shop', err);
        alert('Failed to create shop: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
