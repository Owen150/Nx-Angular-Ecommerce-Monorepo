import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductsService: {
    getAllProducts: ReturnType<typeof vi.fn>;
    error: () => string | null;
  };
  let mockRouter: Partial<Router>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      quantity: 5,
      imageUrl: 'https://example.com/1.jpg',
      seller: null,
      stock: 5,
      category: { id: 1, name: 'Electronics', description: 'Electronics' },
      inStock: true,
      rating: 4.5,
      reviewCount: 100,
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      quantity: 0,
      imageUrl: null,
      seller: null,
      stock: 0,
      category: null,
      inStock: false,
      rating: null,
      reviewCount: null,
    },
  ];

  beforeEach(async () => {
    mockProductsService = {
      getAllProducts: vi.fn().mockReturnValue(of(mockProducts)),
      error: () => null,
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('creates and loads products from the backend on init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockProductsService.getAllProducts).toHaveBeenCalledOnce();
    expect(component.products()).toEqual(mockProducts);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('renders backend products in the product grid', () => {
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('shop-product-card');
    expect(cards).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Uncategorized');
  });

  it('navigates to a product detail using its numeric ID', () => {
    component.onProductSelect(mockProducts[0]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 1]);
  });

  it('shows a load error recorded by the products service', () => {
    mockProductsService.getAllProducts.mockReturnValue(of([]));
    mockProductsService.error = () => 'Backend is unavailable';

    fixture.detectChanges();

    expect(component.error()).toContain('Backend is unavailable');
    expect(fixture.nativeElement.textContent).toContain(
      'Failed to load products: Backend is unavailable'
    );
  });
});
