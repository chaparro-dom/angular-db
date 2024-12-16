import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { UserService, User } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class DashboardComponent implements OnInit {
  // Stats data
  totalProducts: number = 0;
  totalUsers: number = 0;
  activeUsers: number = 0;
  adminUsers: number = 0;
  usersByRole: { [key: string]: number } = {};
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  selectedUser: User | null = null;
  showUserForm: boolean = false;
  newUser: Omit<User, 'id'> & { password: string } = {
    username: '',
    email: '',
    role: 'user',
    active: true,
    password: '',
    createdAt: new Date().toISOString()
  };

  userRole: string = '';
  username: string = '';
  isSidebarOpen: boolean = true;

  constructor(
    private router: Router, 
    private productService: ProductService,
    private userService: UserService,
    private toastr: ToastrService
  ) { 
    this.username = localStorage.getItem('username') || '';
    this.userRole = localStorage.getItem('role') || '';
    // Initialize sidebar state from localStorage
    const sidebarState = localStorage.getItem('sidebarState');
    this.isSidebarOpen = sidebarState === null ? true : sidebarState === 'true';
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Cargar estadísticas de usuarios
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalUsers = users.length;
        this.activeUsers = users.filter(user => user.active).length;
        this.adminUsers = users.filter(user => user.role === 'admin').length;

        // Calcular usuarios por rol
        this.usersByRole = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de usuarios:', error);
        this.toastr.error('Error al cargar estadísticas');
      }
    });

    // Cargar estadísticas de productos si es necesario
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de productos:', error);
        this.toastr.error('Error al cargar estadísticas de productos');
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    localStorage.setItem('sidebarState', this.isSidebarOpen.toString());
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isManager(): boolean {
    return this.userRole === 'manager';
  }

  isUser(): boolean {
    return this.userRole === 'user';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  goToUsers(): void {
    this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/user']);
    });
  }

  goToProductos(): void {
    this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/productos']);
    });
  }

  goToEstadisticas(): void {
    this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/estadisticas']);
    });
  }
}
