import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, CompraEstadistica } from '../services/estadisticas.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit, OnDestroy {
  private barChart?: Chart;
  private lineChart?: Chart;
  public totalCompras: number = 0;
  public totalVentas: number = 0;
  public promedioCompras: number = 0;

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }

  private cargarDatos(): void {
    this.estadisticasService.getComprasEstadisticas().subscribe({
      next: (datos: CompraEstadistica[]) => {
        this.calcularEstadisticas(datos);
        this.createBarChart(datos);
        this.createLineChart(datos);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  private calcularEstadisticas(datos: CompraEstadistica[]): void {
    this.totalCompras = datos.reduce((sum, d) => sum + d.cantidad, 0);
    this.totalVentas = datos.reduce((sum, d) => sum + d.total, 0);
    this.promedioCompras = this.totalCompras / (datos.length || 1);
  }

  private createBarChart(datos: CompraEstadistica[]): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.map(d => d.fecha),
        datasets: [
          {
            label: 'Cantidad de Órdenes',
            data: datos.map(d => d.cantidad),
            backgroundColor: 'rgba(0, 156, 130, 0.5)',
            borderColor: 'rgb(0, 156, 130)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Total de Ventas ($)',
            data: datos.map(d => d.total),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Cantidad de Órdenes'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Total de Ventas ($)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Estadísticas de Ventas por Día'
          }
        }
      }
    });
  }

  private createLineChart(datos: CompraEstadistica[]): void {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    // Calcular el acumulado
    let acumuladoCompras = 0;
    let acumuladoVentas = 0;
    const datosAcumulados = datos.map(d => {
      acumuladoCompras += d.cantidad;
      acumuladoVentas += d.total;
      return {
        fecha: d.fecha,
        compras: acumuladoCompras,
        ventas: acumuladoVentas
      };
    });

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datosAcumulados.map(d => d.fecha),
        datasets: [
          {
            label: 'Órdenes Acumuladas',
            data: datosAcumulados.map(d => d.compras),
            borderColor: 'rgb(0, 156, 130)',
            backgroundColor: 'rgba(0, 156, 130, 0.1)',
            tension: 0.1,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Ventas Acumuladas ($)',
            data: datosAcumulados.map(d => d.ventas),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.1,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Órdenes Acumuladas'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Ventas Acumuladas ($)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Acumulado de Ventas'
          }
        }
      }
    });
  }
}
