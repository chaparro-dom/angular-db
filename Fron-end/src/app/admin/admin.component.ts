import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>Panel de Administración</h1>
      <p>Bienvenido al panel de administración</p>
      
      <div class="admin-content">
        <div class="admin-card">
          <h3>Usuarios</h3>
          <p>Gestionar usuarios del sistema</p>
        </div>
        
        <div class="admin-card">
          <h3>Configuración</h3>
          <p>Configuración del sistema</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
    }

    .admin-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .admin-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .admin-card:hover {
      transform: translateY(-5px);
    }

    .admin-card h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .admin-card p {
      color: #666;
    }
  `]
})
export class AdminComponent {
}
