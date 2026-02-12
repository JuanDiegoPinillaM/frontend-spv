import { Component, OnInit, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SalesService } from '../../core/services/sales.service';
import { AuthService } from '../../core/services/auth.service';
import { FeatherModule } from 'angular-feather';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FeatherModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private salesService = inject(SalesService);
  private authService = inject(AuthService);

  // Signals
  summary = signal<any>({ totalAmount: 0, count: 0, itemsSold: 0 });
  recentSales = signal<any[]>([]);
  isLoading = signal(true);
  currentUser = this.authService.currentUser;

  // Fecha actual
  currentDate = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Charts
  private salesChart: Chart | null = null;
  private productsChart: Chart | null = null;

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Esperamos un poco para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  loadData() {
    this.salesService.getDailySummary().subscribe({
      next: (data) => {
        console.log('Datos recibidos en Angular:', data);
        
        const finalData = Array.isArray(data) ? data[0] : data;
        this.summary.set(finalData || { totalAmount: 0, count: 0, itemsSold: 0 });
        
        // Simulamos ventas recientes (reemplazar con llamada real al backend)
        this.loadRecentSales();
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.isLoading.set(false);
      }
    });
  }

  loadRecentSales() {
    // TODO: Reemplazar con llamada real al servicio
    // Por ahora usamos datos de ejemplo
    const mockSales = [
      {
        id: 'sale_' + Date.now() + '001',
        date: new Date(),
        customer: 'Juan Pérez',
        itemsCount: 3,
        total: 45000,
        status: 'completed'
      },
      {
        id: 'sale_' + Date.now() + '002',
        date: new Date(Date.now() - 3600000),
        customer: 'María García',
        itemsCount: 2,
        total: 32000,
        status: 'completed'
      },
      {
        id: 'sale_' + Date.now() + '003',
        date: new Date(Date.now() - 7200000),
        customer: 'Carlos López',
        itemsCount: 5,
        total: 78000,
        status: 'completed'
      }
    ];
    
    this.recentSales.set(mockSales);
  }

  getAverageTicket(): number {
    const count = this.summary()?.count || 0;
    const total = this.summary()?.totalAmount || 0;
    return count > 0 ? total / count : 0;
  }

  initCharts() {
    this.createSalesChart();
    this.createProductsChart();
  }

  createSalesChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas',
          data: [120000, 150000, 180000, 140000, 200000, 250000, 190000],
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: '#6366f1',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            borderColor: '#374151',
            borderWidth: 1,
            titleColor: '#f3f4f6',
            bodyColor: '#f3f4f6',
            callbacks: {
              label: function(context) {
                const value = context.parsed.y ?? 0;
                return ' $' + value.toLocaleString('es-CO');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              color: '#6b7280',
              callback: function(tickValue) {
                const value = typeof tickValue === 'number' ? tickValue : 0;
                return '$' + (value / 1000) + 'k';
              }
            }
          },
          x: {
            border: {
              display: false
            },
            grid: {
              display: false
            },
            ticks: {
              color: '#6b7280'
            }
          }
        }
      }
    };

    this.salesChart = new Chart(ctx, config);
  }

  createProductsChart() {
    const canvas = document.getElementById('productsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (this.productsChart) {
      this.productsChart.destroy();
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Bebidas', 'Snacks', 'Alimentos', 'Otros'],
        datasets: [{
          data: [30, 25, 35, 10],
          backgroundColor: [
            '#6366f1',
            '#10b981',
            '#f59e0b',
            '#8b5cf6'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return ' ' + context.label + ': ' + context.parsed + '%';
              }
            }
          }
        },
        cutout: '65%'
      }
    };

    this.productsChart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    // Limpiar gráficos al destruir el componente
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.productsChart) {
      this.productsChart.destroy();
    }
  }
}