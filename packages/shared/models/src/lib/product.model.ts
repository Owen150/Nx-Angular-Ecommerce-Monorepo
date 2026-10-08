export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  seller: Seller | null;
  stock: number;
  category: Category | null;
  inStock: boolean | null;
  rating: number | null;
  reviewCount: number | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Seller {
  id: number;
  businessName: string;
  email: string;
  stripeAccountId: string;
  stripeOnboardingComplete: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
  sortOrder?: 'asc' | 'desc';
}