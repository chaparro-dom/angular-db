import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    role: string;
    token: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  errors = {
    username: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Verificar si ya hay un token válido
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado, redirigiendo a dashboard...');
      this.router.navigate(['dashboard']).then(
        () => console.log('Redirección exitosa'),
        (err) => console.error('Error en redirección:', err)
      );
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.errors = {
      username: '',
      password: ''
    };

    if (!this.username) {
      this.errors.username = 'El nombre de usuario es requerido';
      isValid = false;
    } else if (this.username.length < 3) {
      this.errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!this.password) {
      this.errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    return isValid;
  }

  login() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    console.log('Iniciando login...');

    const loginData = {
      username: this.username.trim(),
      password: this.password
    };

    this.http.post<LoginResponse>('http://localhost:3001/api/users/login', loginData)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          if (response.success && response.data && response.data.token) {
            // Guardar datos en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.id.toString());
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role); // Agregando el rol del usuario
            
            this.toastr.success('¡Bienvenido!', 'Login exitoso');
            
            console.log('Redirigiendo a dashboard...');
            
            // Redirigir al dashboard
            this.router.navigate(['dashboard'])
              .then(() => {
                console.log('Redirección exitosa');
                this.loading = false;
              })
              .catch(error => {
                console.error('Error en redirección:', error);
                this.toastr.error('Error al redireccionar');
                this.loading = false;
              });
          } else {
            console.error('Respuesta inválida:', response);
            this.toastr.error('Respuesta inválida del servidor');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error:', error);
          let errorMessage = 'Error al iniciar sesión';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          }
          
          this.toastr.error(errorMessage, 'Error');
          this.loading = false;
        }
      });
  }
}
