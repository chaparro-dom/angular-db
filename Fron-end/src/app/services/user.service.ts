import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface UserRegisterDto {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UserUpdateDto {
  username?: string;
  email?: string;
  roleId?: number;
  active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: { name: string } | string;
  active: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  private extractRole(role: { name: string } | string | undefined): string {
    if (!role) return 'user';
    if (typeof role === 'string') return role;
    return role.name || 'user';
  }

  private mapUserResponse(user: UserResponse): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: this.extractRole(user.role),
      active: user.active,
      createdAt: user.createdAt
    };
  }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/users`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener usuarios');
        }
        return response.data.map(user => this.mapUserResponse(user));
      })
    );
  }

  createUser(userData: UserRegisterDto): Observable<User> {
    // Asegurar que los datos estén en el formato correcto
    const requestData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      roleId: Number(userData.roleId) // Asegurar que roleId es un número
    };

    console.log('Datos enviados al servidor:', requestData);
    
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}/users/register`, requestData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al crear usuario');
        }
        return this.mapUserResponse(response.data);
      })
    );
  }

  updateUser(id: number, updateData: UserUpdateDto): Observable<User> {
    // Asegurar que los datos estén en el formato correcto
    const requestData = {
      username: updateData.username,
      email: updateData.email,
      roleId: updateData.roleId ? Number(updateData.roleId) : undefined // Asegurar que roleId es un número
    };

    console.log('Datos enviados al servidor:', requestData);

    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/users/${id}`, requestData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al actualizar usuario');
        }
        return this.mapUserResponse(response.data);
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar usuario');
        }
      })
    );
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<ApiResponse<UserResponse>>(`${this.apiUrl}/users/${id}/toggle-status`, {}).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Error al cambiar el estado del usuario');
        }
        const user = response.data;
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: this.extractRole(user.role),
          active: user.active,
          createdAt: user.createdAt
        };
      })
    );
  }
}
