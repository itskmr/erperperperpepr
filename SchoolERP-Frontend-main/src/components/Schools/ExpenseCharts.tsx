// ExpenseCharts.tsx
import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { getCategoryColor, getCategoryLabel } from './ExpenseTrackerTypes';

// Register Chart.js components
Chart.register(...registerables);

interface ExpenseChartProps {
  categoryTotals: Record<string, number>;
  monthlyData: number[];
  filteredYear: string;
}

const ExpenseCharts: React.FC<ExpenseChartProps> = ({ 
  categoryTotals, 
  monthlyData, 
  filteredYear 
}) => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderBarChart();
    renderPieChart();
    renderLineChart();
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      destroyChart(barChartRef.current);
      destroyChart(pieChartRef.current);
      destroyChart(lineChartRef.current);
    };
  }, [categoryTotals, monthlyData, filteredYear]);

  const destroyChart = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      const chart = Chart.getChart(canvas);
      if (chart) {
        chart.destroy();
      }
    }
  };

  const renderBarChart = () => {
    if (barChartRef.current) {
      const barChartCtx = barChartRef.current.getContext('2d');
      
      // Destroy existing chart if it exists
      destroyChart(barChartRef.current);
      
      if (barChartCtx) {
        const categories = Object.keys(categoryTotals);
        
        // ExpenseCharts.tsx (continued)
        const config: ChartConfiguration = {
            type: 'bar',
            data: {
              labels: categories.map(cat => getCategoryLabel(cat)),
              datasets: [{
                label: 'Expenses by Category',
                data: categories.map(cat => categoryTotals[cat] || 0),
                backgroundColor: categories.map(cat => getCategoryColor(cat)),
                borderColor: categories.map(cat => getCategoryColor(cat)),
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Amount ($)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Category'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw}`;
                    }
                  }
                }
              }
            }
          };
          
          new Chart(barChartCtx, config);
        }
      }
    };
  
    const renderPieChart = () => {
      if (pieChartRef.current) {
        const pieChartCtx = pieChartRef.current.getContext('2d');
        
        // Destroy existing chart if it exists
        destroyChart(pieChartRef.current);
        
        if (pieChartCtx) {
          const categories = Object.keys(categoryTotals);
          
          const config: ChartConfiguration = {
            type: 'doughnut',
            data: {
              labels: categories.map(cat => getCategoryLabel(cat)),
              datasets: [{
                data: categories.map(cat => categoryTotals[cat] || 0),
                backgroundColor: categories.map(cat => getCategoryColor(cat)),
                borderColor: '#ffffff',
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.raw as number;
                      const total = context.chart.data.datasets.data.reduce((a: number, b: number) => a + b, 0) as number;
                      const percentage = Math.round((value / total) * 100);
                      return `${getCategoryLabel(categories[context.dataIndex])}: $${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }
          };
          
          new Chart(pieChartCtx, config);
        }
      }
    };
  
    const renderLineChart = () => {
      if (lineChartRef.current) {
        const lineChartCtx = lineChartRef.current.getContext('2d');
        
        // Destroy existing chart if it exists
        destroyChart(lineChartRef.current);
        
        if (lineChartCtx) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const config: ChartConfiguration = {
            type: 'line',
            data: {
              labels: monthNames,
              datasets: [{
                label: `Monthly Expenses (${filteredYear})`,
                data: monthlyData,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Amount ($)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Month'
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw}`;
                    }
                  }
                }
              }
            }
          };
          
          new Chart(lineChartCtx, config);
        }
      }
    };
  
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Expenses by Category</h3>
          <div className="h-64">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Category Distribution</h3>
          <div className="h-64">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Monthly Expense Trends ({filteredYear})</h3>
          <div className="h-64">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>
      </div>
    );
  };
  
  export default ExpenseCharts;