import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  isDarkMode: boolean = false;
  isDashboardVisible: boolean = true;

  constructor() {
    // Recuperar el estado del modo oscuro
    const darkModeState = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeState === 'true';

    // Recuperar el estado del dashboard
    const dashboardState = localStorage.getItem('dashboardVisible');
    this.isDashboardVisible = dashboardState === null ? true : dashboardState === 'true';
  }

  ngOnInit() {
    // Aplicar el modo oscuro si está activo
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  toggleDashboard() {
    this.isDashboardVisible = !this.isDashboardVisible;
    localStorage.setItem('dashboardVisible', this.isDashboardVisible.toString());
  }
}
