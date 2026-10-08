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
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    seller: null,
    stock: 5,
    category: { id: 1, name: 'Electronics', description: 'Electronics' },
    inStock: true,
    rating: 4.5,
    reviewCount: 100,
    quantity: 5,
  };
  const relatedProduct: Product = {
    ...mockProduct,
    id: 2,
    name: 'Related Product',
  };

  beforeEach(async () => {
    mockProductsService = {
      getProductById: vi.fn(),
      getAllProducts: vi.fn().mockReturnValue(of([])),
      error: () => null,
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

    expect(mockProductsService.getProductById).toHaveBeenCalledWith(1);
    expect(component.product()).toEqual(mockProduct);
    expect(mockProductsService.getAllProducts).toHaveBeenCalledOnce();
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(null);
  });

  it('loads up to six other products from the same category', () => {
    mockProductsService.getProductById.mockReturnValue(of(mockProduct));
    mockProductsService.getAllProducts.mockReturnValue(
      of([
        mockProduct,
        relatedProduct,
        { ...relatedProduct, id: 3, name: 'Another Related Product' },
        {
          ...relatedProduct,
          id: 4,
          name: 'Different Category Product',
          category: { id: 2, name: 'Software', description: 'Software' },
        },
      ])
    );

    component.ngOnInit();

    expect(component.relatedProducts()).toEqual([
      relatedProduct,
      { ...relatedProduct, id: 3, name: 'Another Related Product' },
    ]);
  });

  it('does not load related products if the product has no category', () => {
    mockProductsService.getProductById.mockReturnValue(
      of({ ...mockProduct, category: null })
    );

    component.ngOnInit();

    expect(mockProductsService.getAllProducts).not.toHaveBeenCalled();
    expect(component.relatedProducts()).toEqual([]);
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

  it('should render backend products when optional fields are null', () => {
    const productWithNullFields: Product = {
      ...mockProduct,
      imageUrl: null,
      category: null,
      inStock: null,
      rating: null,
      reviewCount: null,
    };
    mockProductsService.getProductById.mockReturnValue(of(productWithNullFields));

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.product-name').textContent).toContain(
      'Test Product'
    );
    expect(compiled.querySelector('.product-info dd').textContent).toContain(
      'Uncategorized'
    );
    expect(compiled.querySelector('.product-image').getAttribute('src')).toBe(
      '/product-placeholder.svg'
    );
  });

  it('should calculate star ratings correctly', () => {
    component.product.set(mockProduct);

    const stars = component.getStars();

    expect(stars).toEqual([true, true, true, true, true]);
  });

  it('rejects invalid route IDs without calling the backend', () => {
    component.loadProduct('not-a-number');

    expect(mockProductsService.getProductById).not.toHaveBeenCalled();
    expect(component.error()).toBe('Invalid product ID');
    expect(component.loading()).toBe(false);
  });

  it('should handle add to cart action', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    component.product.set(mockProduct);

    component.addToCart();

    expect(consoleSpy).toHaveBeenCalledWith('Adding to cart:', 1);
    expect(alertSpy).toHaveBeenCalledWith('Product added to cart!');
  });
});
