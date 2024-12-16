import { Component, OnInit, AfterViewChecked, Renderer2 } from '@angular/core';
import { UserService, UserRegisterDto, UserUpdateDto, User } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface UserForm {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: string;
  roleId: number;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserComponent implements OnInit, AfterViewChecked {
  usuarios: User[] = [];
  usuariosFiltrados: User[] = [];
  mostrarFormulario = false;
  editando = false;
  usuarioForm: UserForm;
  isLoading = false;
  error = '';
  searchQuery: string = '';
  isSearching: boolean = false;
  isDarkMode: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2
  ) {
    this.usuarioForm = this.getEmptyUserForm();
    this.setupSearch();
    this.checkSystemTheme();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.checkSystemTheme();
  }

  ngAfterViewChecked(): void {
    if (this.isDarkMode) {
      this.applyDarkMode();
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users;
      this.usuariosFiltrados = [...this.usuarios];
    });
  }

  getEmptyUserForm(): UserForm {
    return {
      username: '',
      email: '',
      password: '',
      role: '',
      roleId: 0
    };
  }

  searchUsers(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.usuariosFiltrados = [...this.usuarios];
  }

  agregarUsuario(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.usuarioForm = this.getEmptyUserForm();
  }

  editarUsuario(usuario: User): void {
    this.mostrarFormulario = true;
    this.editando = true;
    this.usuarioForm = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
      roleId: this.getRoleId(usuario.role),
      password: ''
    };
  }

  private getRoleId(role: string): number {
    switch (role) {
      case 'admin': return 1;
      case 'manager': return 2;
      case 'user': return 3;
      default: return 3;
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.toastr.success('Usuario eliminado correctamente');
        this.loadUsers();
      });
    }
  }

  guardarUsuario(): void {
    if (!this.usuarioForm.username || !this.usuarioForm.email || (!this.editando && !this.usuarioForm.password)) {
      this.toastr.error('Por favor complete todos los campos requeridos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.usuarioForm.email)) {
      this.toastr.error('Por favor ingrese un email válido');
      return;
    }

    if (!this.editando && this.usuarioForm.password.length < 6) {
      this.toastr.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!this.usuarioForm.role) {
      this.toastr.error('Por favor seleccione un rol');
      return;
    }

    if (this.editando && this.usuarioForm.id) {
      const updateData: UserUpdateDto = {
        username: this.usuarioForm.username.trim(),
        email: this.usuarioForm.email.trim(),
        roleId: this.getRoleId(this.usuarioForm.role)
      };

      this.userService.updateUser(this.usuarioForm.id, updateData).subscribe({
        next: () => {
          this.toastr.success('Usuario actualizado correctamente');
          this.cerrarFormulario();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.toastr.error('Error al actualizar usuario');
        }
      });
    } else {
      const createData: UserRegisterDto = {
        username: this.usuarioForm.username.trim(),
        email: this.usuarioForm.email.trim(),
        password: this.usuarioForm.password,
        roleId: this.getRoleId(this.usuarioForm.role)
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.toastr.success('Usuario creado correctamente');
          this.cerrarFormulario();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.toastr.error('Error al crear usuario');
        }
      });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.usuarioForm = this.getEmptyUserForm();
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.isSearching = !!searchTerm;
      if (!searchTerm) {
        this.usuariosFiltrados = [...this.usuarios];
        return;
      }
      
      const searchTermLower = searchTerm.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.username.toLowerCase().includes(searchTermLower) ||
        usuario.email.toLowerCase().includes(searchTermLower)
      );
    });
  }

  checkSystemTheme(): void {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkMode = true;
    }
  }

  applyDarkMode(): void {
    this.renderer.addClass(document.body, 'dark-mode');
    const elements = document.querySelectorAll('.content, .table-container, .users-table, th, td');
    elements.forEach(element => {
      this.renderer.addClass(element, 'dark-mode');
    });
  }

  removeDarkMode(): void {
    this.renderer.removeClass(document.body, 'dark-mode');
    const elements = document.querySelectorAll('.content, .table-container, .users-table, th, td');
    elements.forEach(element => {
      this.renderer.removeClass(element, 'dark-mode');
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    
    if (this.isDarkMode) {
      this.applyDarkMode();
    } else {
      this.removeDarkMode();
    }
  }

  isAdmin(): boolean {
    return true;
  }
}