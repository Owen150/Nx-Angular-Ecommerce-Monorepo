import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService, OrderService, PaymentService } from '@org/shop/data';

@Component({
  selector: 'shop-checkout',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <section class="checkout-page">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <a routerLink="/cart" class="back-link">← Back to cart</a>
      </div>

      @if (cartItems().length === 0) {
        <div class="empty-checkout">
          <p>Your cart is empty. Add items before checking out.</p>
          <a routerLink="/products" class="primary-link">View products</a>
        </div>
      } @else {
        <div class="checkout-layout">
          <div class="checkout-panel">
            <h2>Shipping Information</h2>
            <div class="form-grid">
              <label>
                <span>Full name</span>
                <input type="text" value="Jane Smith" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value="jane@example.com" />
              </label>
              <label class="full-width">
                <span>Address</span>
                <input type="text" value="123 Market Street" />
              </label>
              <label>
                <span>City</span>
                <input type="text" value="Boston" />
              </label>
              <label>
                <span>Postal code</span>
                <input type="text" value="02116" />
              </label>
            </div>
          </div>

          <aside class="summary-panel">
            <h2>Order Summary</h2>

            @for (item of cartItems(); track item.id) {
              <div class="summary-item">
                <span>{{ item.product.name }} × {{ item.quantity }}</span>
                <strong>{{ item.product.price * item.quantity | currency }}</strong>
              </div>
            }

            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ subtotal() | currency }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>{{ shipping() | currency }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ total() | currency }}</span>
            </div>

            <button type="button" class="place-order-button" (click)="placeOrder()">
              Place Order
            </button>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .checkout-page {
        padding: 2rem;
      }

      .checkout-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .checkout-header h1 {
        margin: 0;
        color: #111827;
      }

      .back-link,
      .primary-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
      }

      .empty-checkout {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        color: #374151;
      }

      .checkout-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
        gap: 2rem;
      }

      .checkout-panel,
      .summary-panel {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
      }

      .checkout-panel h2,
      .summary-panel h2 {
        margin-top: 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        color: #374151;
        font-weight: 600;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      input {
        padding: 0.8rem 0.9rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font: inherit;
      }

      .summary-panel {
        background: #f9fafb;
      }

      .summary-item,
      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.8rem;
      }

      .summary-row.total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #d1d5db;
        font-size: 1.1rem;
        font-weight: 700;
      }

      .place-order-button {
        width: 100%;
        margin-top: 1rem;
        padding: 0.9rem 1.25rem;
        border: none;
        border-radius: 10px;
        background: #16a34a;
        color: white;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .checkout-layout,
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);

  readonly cartItems = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = computed(() => (this.cartItems().length > 0 ? 15 : 0));
  readonly total = computed(() => this.subtotal() + this.shipping());

  orderId = 1;
  placeOrder(): void {
    if (this.cartItems().length === 0) {
      return;
    }
    // save order to the db
    this.cartService.clearCart();
    alert('Order placed successfully!');
    // this.router.navigate(['/products']);
    this.pay();
  }

  pay(): void {
    this.paymentService
      .createCheckout(this.orderId)
      .subscribe({
        next: (response) => {
          window.location.href =
            response.checkoutUrl;
        },
        error: (error) => {
          console.error(
            'Checkout creation failed',
            error
          );
        }
      });
  }
}
