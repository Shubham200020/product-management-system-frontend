import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-restock',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restock.component.html',
  styleUrls: ['./restock.component.css']
})
export class RestockComponent implements OnInit {
  recommendations: any[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.loading = true;
    this.productService.getRestockRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching recommendations', err);
        this.loading = false;
      }
    });
  }

  getUrgencyClass(urgency: string) {
    return urgency.toLowerCase();
  }
}
