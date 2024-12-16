import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3001/api/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Producto[]> {
    return this.http.get<ApiResponse<Producto[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getProduct(id: number): Observable<Producto> {
    return this.http.get<ApiResponse<Producto>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createProduct(product: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>): Observable<Producto> {
    return this.http.post<ApiResponse<Producto>>(this.apiUrl, product)
      .pipe(map(response => response.data));
  }

  updateProduct(id: number, product: Partial<Producto>): Observable<Producto> {
    return this.http.put<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, product)
      .pipe(map(response => response.data));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  searchProducts(query: string): Observable<Producto[]> {
    return this.http.get<ApiResponse<Producto[]>>(`${this.apiUrl}/search?name=${encodeURIComponent(query)}`)
      .pipe(map(response => response.data));
  }
}
