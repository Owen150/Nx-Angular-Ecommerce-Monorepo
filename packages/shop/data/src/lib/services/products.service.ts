import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Category, Product } from '@org/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Signals for state management
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  getAllProducts(): Observable<Product[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        map((products) => {
          this.loadingSignal.set(false);
          return products;
        }),
        catchError((error: unknown) => {
          this.loadingSignal.set(false);
          const message =
            error instanceof Error
              ? error.message
              : 'An error occurred while loading products';
          this.errorSignal.set(message);
          console.error('Error loading products:', error);
          return of([]);
        })
      );
  }

  getProductById(id: number): Observable<Product | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .get<Product>(`${this.apiUrl}/products/${id}`)
      .pipe(
        map((response) => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError((error: unknown) => {
          this.loadingSignal.set(false);
          const message =
            error instanceof Error
              ? error.message
              : 'An error occurred while loading the product';
          this.errorSignal.set(message);
          console.error('Error loading product:', error);
          return of(null);
        })
      );
  }

  getCategories(): Observable<string[]> {
    return this.http
      .get<Category[]>(`${this.apiUrl}/products/categories`)
      .pipe(
        map((categories) => categories.map((category) => category.name)),
        catchError((error: unknown) => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      );
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        map((products) => {
          if (products.length === 0) {
            return { min: 0, max: 1000 };
          }

          const prices = products.map((product) => product.price);
          return {
            min: Math.min(...prices),
            max: Math.max(...prices),
          };
        }),
        catchError((error) => {
          console.error('Error loading price range:', error);
          return of({ min: 0, max: 1000 });
        })
      );
  }
}