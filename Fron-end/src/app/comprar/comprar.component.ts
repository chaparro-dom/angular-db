import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comprar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comprar.component.html',
  styleUrls: ['./comprar.component.css']
})
export class ComprarComponent implements OnInit {
  producto: any = null;
  cantidad: number = 1;
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.router.navigate(['/productos']);
      return;
    }

    this.productService.getProduct(Number(productId)).subscribe({
      next: (product) => {
        this.producto = product;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el producto: ' + error.message;
        this.isLoading = false;
        this.toastr.error('Error al cargar el producto');
      }
    });
  }

  realizarCompra() {
    if (!this.producto || this.cantidad <= 0 || this.cantidad > this.producto.stock) {
      this.toastr.error('Cantidad no válida');
      return;
    }

    const updatedProduct = {
      ...this.producto,
      stock: this.producto.stock - this.cantidad
    };

    this.productService.updateProduct(this.producto.id, updatedProduct).subscribe({
      next: () => {
        this.toastr.success('Compra realizada con éxito');
        this.router.navigate(['/dashboard/productos']);
      },
      error: (error) => {
        this.error = 'Error al realizar la compra: ' + error.message;
        this.toastr.error('Error al realizar la compra');
      }
    });
  }

  cancelarCompra() {
    this.router.navigate(['/dashboard/productos']);
  }
}
