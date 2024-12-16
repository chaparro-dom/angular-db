import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Producto } from '../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  productoForm: Producto;
  isLoading = false;
  error = '';
  isDarkMode: boolean = false;
  username: string = '';
  userRole: string = '';
  searchQuery: string = '';
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();

  // Método para verificar si el usuario tiene privilegios de administración
  isAdmin(): boolean {
    console.log('Current user role:', this.userRole);
    const hasAdminAccess = this.userRole === 'admin' || this.userRole === 'manager';
    console.log('Has admin access:', hasAdminAccess);
    return hasAdminAccess;
  }

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.productoForm = this.getEmptyProductForm();
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode) {
      this.isDarkMode = darkMode === 'true';
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      }
    }

    // Configurar el debounce para la búsqueda
    this.searchSubject.pipe(
      debounceTime(300), // Esperar 300ms después de la última entrada
      distinctUntilChanged() // Solo emitir si el valor ha cambiado
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = localStorage.getItem('username') || 'Usuario';
    this.userRole = localStorage.getItem('role') || 'user';
    console.log('Role loaded in ngOnInit:', this.userRole);
    this.loadProducts();
    console.log('Rol del usuario:', this.userRole); 
    this.loadProducts();
   
  }

  private getEmptyProductForm(): Producto {
    return {
      id: 0,
      name: '',
      description: '',
      price: '0.00',
      stock: 0,
      category: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.productos = products;
        this.productosFiltrados = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar los productos';
        this.isLoading = false;
      }
    });
  }

  agregarProducto() {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.productoForm = this.getEmptyProductForm();
  }

  guardarProducto() {
    // Asegurar que el precio es un string con formato correcto
    const priceValue = typeof this.productoForm.price === 'string' 
      ? parseFloat(this.productoForm.price)
      : this.productoForm.price;
    
    const formattedProduct: Producto = {
      ...this.productoForm,
      price: priceValue.toFixed(2),
      stock: typeof this.productoForm.stock === 'string' 
        ? parseInt(this.productoForm.stock, 10)
        : this.productoForm.stock
    };

    if (this.modoEdicion) {
      this.productService.updateProduct(formattedProduct.id, formattedProduct).subscribe({
        next: (updatedProduct) => {
          const index = this.productos.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.productos[index] = updatedProduct;
          }
          this.cerrarFormulario();
          this.toastr.success('Producto actualizado con éxito');
        },
        error: (error) => {
          this.error = 'Error al actualizar el producto: ' + error.message;
          this.toastr.error('Error al actualizar el producto');
          console.error('Error completo:', error);
        }
      });
    } else {
      const { id, createdAt, updatedAt, ...newProduct } = formattedProduct;
      this.productService.createProduct(newProduct).subscribe({
        next: (createdProduct) => {
          this.productos.push(createdProduct);
          this.cerrarFormulario();
          this.toastr.success('Producto creado con éxito');
        },
        error: (error) => {
          this.error = 'Error al crear el producto: ' + error.message;
          this.toastr.error('Error al crear el producto');
          console.error('Error completo:', error);
        }
      });
    }
  }

  editarProducto(producto: Producto) {
    this.productoForm = { ...producto };
    this.mostrarFormulario = true;
    this.modoEdicion = true;
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== id);
          this.toastr.success('Producto eliminado con éxito');
        },
        error: (error) => {
          this.error = 'Error al eliminar el producto: ' + error.message;
          this.toastr.error('Error al eliminar el producto');
        }
      });
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.productoForm = this.getEmptyProductForm();
  }

  comprarProducto(producto: Producto) {
    if (producto.stock > 0) {
      this.router.navigate(['/dashboard/comprar', producto.id]);
    } else {
      this.toastr.error('Producto sin stock disponible');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    this.toastr.success('Sesión cerrada exitosamente', 'Hasta pronto');
    
    this.router.navigate(['/login'])
      .then(() => console.log('Redirigido al login después de cerrar sesión'))
      .catch(error => console.error('Error al redirigir:', error));
  }

  // Método para iniciar la búsqueda
  searchProducts(): void {
    this.searchSubject.next(this.searchQuery);
  }

  // Método para realizar la búsqueda
  private performSearch(query: string): void {
    if (!query.trim()) {
      this.productosFiltrados = this.productos;
      this.isSearching = false;
      return;
    }
    
    this.isSearching = true;
    const searchTerm = query.toLowerCase().trim();
    this.productosFiltrados = this.productos.filter(producto => 
      producto.name.toLowerCase().includes(searchTerm)
    );
  }

  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.productosFiltrados = this.productos;
  }

  reloadComponent() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
