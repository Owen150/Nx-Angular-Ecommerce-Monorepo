import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-products').then(m => m.featureProductsRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-product-detail').then(
        m => m.featureProductDetailRoutes
      ),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('@org/shop/feature-cart').then(m => m.featureCartRoutes),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('@org/shop/feature-checkout').then(m => m.featureCheckoutRoutes),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
