import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // private apiUrl = `${environment.apiUrl}/orders`;
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private readonly http = inject(HttpClient);

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
}
