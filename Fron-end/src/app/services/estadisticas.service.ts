import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CompraEstadistica {
  fecha: string;
  cantidad: number;
  total: number;
}

interface OrderResponse {
  success: boolean;
  data: Order[];
}

interface Order {
  id: number;
  userId: number;
  total: string;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  OrderItems: any[];
  User: {
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  getComprasEstadisticas(): Observable<CompraEstadistica[]> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/orders`).pipe(
      map(response => {
        if (response.success) {
          return this.procesarCompras(response.data);
        }
        return [];
      })
    );
  }

  private procesarCompras(orders: Order[]): CompraEstadistica[] {
    // Agrupar compras por fecha
    const comprasPorFecha = orders.reduce<{ [key: string]: CompraEstadistica }>((acc, order) => {
      const fecha = new Date(order.createdAt).toLocaleDateString();
      if (!acc[fecha]) {
        acc[fecha] = {
          fecha,
          cantidad: 0,
          total: 0
        };
      }
      acc[fecha].cantidad += 1; // Cada orden cuenta como 1
      acc[fecha].total += parseFloat(order.total);
      return acc;
    }, {});

    // Convertir el objeto a array y ordenar por fecha
    return Object.values(comprasPorFecha).sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }
}
