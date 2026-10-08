import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '@org/models';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api';

  const makeProduct = (
    id: number,
    name: string,
    price: number,
    categoryName: string
  ): Product => ({
    id,
    name,
    description: `${name} description`,
    price,
    quantity: 5,
    imageUrl: `${name}.jpg`,
    seller: {
      id: 1,
      businessName: 'Test seller',
      email: 'seller@example.com',
      stripeAccountId: 'acct_test',
      stripeOnboardingComplete: true,
    },
    stock: 5,
    category: {
      id: categoryName === 'Books' ? 2 : 1,
      name: categoryName,
      description: `${categoryName} category`,
    },
    inStock: true,
    rating: 4.5,
    reviewCount: 10,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductsService,
      ],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProducts', () => {
    it('loads products from the configured backend', () => {
      const products = [
        makeProduct(1, 'Book', 25, 'Books'),
        makeProduct(2, 'Headphones', 80, 'Electronics'),
      ];

      service.getAllProducts().subscribe((result) => {
        expect(result).toEqual(products);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
      });

      const request = httpMock.expectOne(`${apiUrl}/products`);
      expect(request.request.method).toBe('GET');
      request.flush(products);
    });

    it('clears loading and records an error when the request fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getAllProducts().subscribe((products) => {
        expect(products).toEqual([]);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeTruthy();
      });

      httpMock
        .expectOne(`${apiUrl}/products`)
        .error(new ProgressEvent('Network error'));
    });
  });

  describe('getProductById', () => {
    it('loads a product from the configured backend', () => {
      const product = makeProduct(1, 'Book', 25, 'Books');

      service.getProductById(1).subscribe((result) => {
        expect(result).toEqual(product);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
      });

      const request = httpMock.expectOne(`${apiUrl}/products/1`);
      expect(request.request.method).toBe('GET');
      request.flush(product);
    });

    it('returns null and records an error when the request fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getProductById(1).subscribe((product) => {
        expect(product).toBeNull();
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeTruthy();
      });

      httpMock
        .expectOne(`${apiUrl}/products/1`)
        .error(new ProgressEvent('Network error'));
    });
  });

  describe('getCategories', () => {
    it('loads category names from the backend categories endpoint', () => {
      service
        .getCategories()
        .subscribe((categories) => expect(categories).toEqual(['Books', 'Electronics']));

      const request = httpMock.expectOne(`${apiUrl}/products/categories`);
      expect(request.request.method).toBe('GET');
      request.flush([
        { id: 1, name: 'Books', description: 'Book category' },
        { id: 2, name: 'Electronics', description: 'Electronics category' },
      ]);
    });

    it('returns an empty list when the categories request fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getCategories().subscribe((categories) => {
        expect(categories).toEqual([]);
      });

      httpMock
        .expectOne(`${apiUrl}/products/categories`)
        .error(new ProgressEvent('Network error'));
    });
  });

  describe('getPriceRange', () => {
    it('derives the range from backend product prices', () => {
      service
        .getPriceRange()
        .subscribe((range) => expect(range).toEqual({ min: 25, max: 80 }));

      const request = httpMock.expectOne(`${apiUrl}/products`);
      expect(request.request.method).toBe('GET');
      request.flush([
        makeProduct(1, 'Book', 25, 'Books'),
        makeProduct(2, 'Headphones', 80, 'Electronics'),
      ]);
    });

    it('returns the default range when the backend has no products', () => {
      service
        .getPriceRange()
        .subscribe((range) => expect(range).toEqual({ min: 0, max: 1000 }));

      httpMock.expectOne(`${apiUrl}/products`).flush([]);
    });

    it('returns the default range when the products request fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service
        .getPriceRange()
        .subscribe((range) => expect(range).toEqual({ min: 0, max: 1000 }));

      httpMock
        .expectOne(`${apiUrl}/products`)
        .error(new ProgressEvent('Network error'));
    });
  });
});
