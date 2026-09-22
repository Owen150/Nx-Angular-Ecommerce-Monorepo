import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheckoutResponse } from '../models/checkout-response';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  createCheckout(orderId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.apiUrl}/checkout`,
      {
        orderId: orderId
      }
    );
  }
}
