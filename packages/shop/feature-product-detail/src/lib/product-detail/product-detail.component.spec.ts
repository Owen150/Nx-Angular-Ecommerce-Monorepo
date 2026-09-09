import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductsService: Partial<ProductsService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    reviewCount: 100,
  };

  beforeEach(async () => {
    mockProductsService = {
      getProductById: vi.fn(),
      getProducts: vi.fn().mockReturnValue(
        of({
          items: [],
          total: 0,
          page: 1,
          pageSize: 12,
          totalPages: 0,
        })
      ),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      paramMap: of(convertToParamMap({ id: '1' })),
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    mockProductsService.getProductById.mockReturnValue(of(mockProduct));

    component.ngOnInit();

    expect(mockProductsService.getProductById).toHaveBeenCalledWith('1');
    expect(component.product()).toEqual(mockProduct);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(null);
  });

  it('should handle error when product not found', () => {
    mockProductsService.getProductById.mockReturnValue(of(null));

    component.ngOnInit();

    expect(component.error()).toBe('Product not found');
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockProductsService.getProductById.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    component.ngOnInit();

    expect(component.error()).toBe('Failed to load product details');
    expect(component.loading()).toBe(false);
    consoleSpy.mockRestore();
  });

  it('should calculate star ratings correctly', () => {
    component.product.set(mockProduct);

    const stars = component.getStars();

    expect(stars).toEqual([true, true, true, true, true]);
  });

  it('should load related products from the same category', () => {
    const relatedProduct: Product = {
      ...mockProduct,
      id: '2',
      name: 'Related Product',
      price: 129.99,
    };

    mockProductsService.getProductById.mockReturnValue(of(mockProduct));
    mockProductsService.getProducts.mockReturnValue(
      of({
        items: [mockProduct, relatedProduct],
        total: 2,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      })
    );

    component.ngOnInit();

    expect(mockProductsService.getProducts).toHaveBeenCalledWith(
      { category: 'Electronics' },
      1,
      12
    );
    expect(component.relatedProducts()).toEqual([relatedProduct]);
  });

  it('should handle add to cart action', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    component.product.set(mockProduct);

    component.addToCart();

    expect(consoleSpy).toHaveBeenCalledWith('Adding to cart:', '1');
    expect(alertSpy).toHaveBeenCalledWith('Product added to cart!');
  });
});
