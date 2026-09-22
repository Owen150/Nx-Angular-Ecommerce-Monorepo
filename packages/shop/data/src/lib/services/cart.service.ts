import { computed, Injectable, signal } from '@angular/core';
import { Product } from '@org/models';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'shop-cart-items';

  readonly items = signal<CartItem[]>(this.loadItems());
  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.items().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  addItem(product: Product): void {
    const existingItem = this.items().find((item) => item.id === product.id);

    const updatedItems = existingItem
      ? this.items().map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...this.items(), { id: product.id, product, quantity: 1 }];

    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  removeItem(productId: string): void {
    const updatedItems = this.items().filter((item) => item.id !== productId);
    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const updatedItems = this.items().map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );

    this.items.set(updatedItems);
    this.persist(updatedItems);
  }

  clearCart(): void {
    this.items.set([]);
    this.persist([]);
  }

  private persist(items: CartItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.warn('Unable to save cart to localStorage:', error);
    }
  }

  private loadItems(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const rawItems = localStorage.getItem(this.storageKey);
      if (!rawItems) {
        return [];
      }

      const parsedItems = JSON.parse(rawItems) as CartItem[];
      return Array.isArray(parsedItems) ? parsedItems : [];
    } catch (error) {
      console.warn('Unable to load cart from localStorage:', error);
      return [];
    }
  }
}
