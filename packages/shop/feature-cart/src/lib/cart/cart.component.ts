import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '@org/shop/data';

@Component({
  selector: 'shop-cart',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <section class="cart-page">
      <div class="cart-header">
        <h1>Your Cart</h1>
        <span class="cart-count">{{ itemCount() }} item(s)</span>
      </div>

      @if (cartItems().length === 0) {
        <div class="empty-cart">
          <p>Your cart is empty.</p>
          <a routerLink="/products" class="secondary-link">Browse products</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartItems(); track item.id) {
              <article class="cart-item">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" />

                <div class="details">
                  <h2>{{ item.product.name }}</h2>
                  <p>{{ item.product.category }}</p>
                  <div class="price-row">
                    <strong>{{ item.product.price | currency }}</strong>
                  </div>
                </div>

                <div class="quantity-controls">
                  <button type="button" (click)="decreaseQuantity(item.id)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button type="button" (click)="increaseQuantity(item.id)">+</button>
                </div>

                <button type="button" class="remove-button" (click)="removeItem(item.id)">
                  Remove
                </button>
              </article>
            }
          </div>

          <aside class="summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items</span>
              <span>{{ itemCount() }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ subtotal() | currency }}</span>
            </div>
            <button type="button" class="checkout-button" (click)="goToCheckout()">
              Proceed to Checkout
            </button>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .cart-page {
        padding: 2rem;
      }

      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .cart-header h1 {
        margin: 0;
        color: #1f2937;
      }

      .cart-count {
        color: #6b7280;
        font-weight: 600;
      }

      .empty-cart {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        color: #374151;
      }

      .secondary-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
      }

      .cart-layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(280px, 0.9fr);
        gap: 2rem;
      }

      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .cart-item {
        display: grid;
        grid-template-columns: 120px 1fr auto auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fff;
      }

      .cart-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
      }

      .details h2 {
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
      }

      .details p {
        margin: 0 0 0.5rem;
        color: #6b7280;
      }

      .price-row {
        color: #111827;
        font-weight: 700;
      }

      .quantity-controls {
        display: inline-flex;
        align-items: center;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        overflow: hidden;
      }

      .quantity-controls button {
        border: none;
        background: #f3f4f6;
        width: 2rem;
        height: 2rem;
        cursor: pointer;
        font-size: 1.2rem;
      }

      .quantity-controls span {
        width: 2.5rem;
        text-align: center;
        font-weight: 600;
      }

      .remove-button {
        border: none;
        background: transparent;
        color: #dc2626;
        font-weight: 600;
        cursor: pointer;
      }

      .summary {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        height: fit-content;
      }

      .summary h2 {
        margin-top: 0;
        margin-bottom: 1rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        color: #374151;
      }

      .summary-row.total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #d1d5db;
        font-size: 1.1rem;
        font-weight: 700;
      }

      .checkout-button {
        width: 100%;
        margin-top: 1rem;
        padding: 0.9rem 1.25rem;
        border: none;
        border-radius: 10px;
        background: #2563eb;
        color: white;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }

        .cart-item {
          grid-template-columns: 1fr;
          text-align: center;
        }
      }
    `,
  ],
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly cartItems = this.cartService.items;
  readonly itemCount = this.cartService.itemCount;
  readonly subtotal = this.cartService.subtotal;

  increaseQuantity(productId: string): void {
    const currentItem = this.cartItems().find((item) => item.id === productId);
    if (!currentItem) {
      return;
    }

    this.cartService.updateQuantity(productId, currentItem.quantity + 1);
  }

  decreaseQuantity(productId: string): void {
    const currentItem = this.cartItems().find((item) => item.id === productId);
    if (!currentItem) {
      return;
    }

    this.cartService.updateQuantity(productId, currentItem.quantity - 1);
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
