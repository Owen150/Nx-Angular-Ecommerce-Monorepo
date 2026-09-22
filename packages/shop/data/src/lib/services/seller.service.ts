import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Seller {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sellers`;

  getSellers(): Observable<Seller[]> {
    return this.http.get<Seller[]>(this.apiUrl);
  }

  getSellerById(id: number): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/${id}`);
  }

  createSeller(seller: Partial<Seller>): Observable<Seller> {
    return this.http.post<Seller>(this.apiUrl, seller);
  }
}
