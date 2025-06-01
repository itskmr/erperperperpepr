// ExpenseTracker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/expenses',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Redirect to login if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export functions
const exportToCSV = (data: Expense[]) => {
  const headers = [
    'Date',
    'Title',
    'Description',
    'Category',
    'Amount',
    'Tax Amount',
    'Discount Amount',
    'Total Amount',
    'Payment Method',
    'Invoice Number',
    'Receipt Number',
    'Status',
    'Notes'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(expense => [
      new Date(expense.expenseDate).toLocaleDateString(),
      `"${expense.title || ''}"`,
      `"${expense.description || ''}"`,
      expense.category || '',
      expense.amount || 0,
      expense.taxAmount || 0,
      expense.discountAmount || 0,
      expense.totalAmount || 0,
      expense.paymentMethod || '',
      `"${expense.invoiceNumber || ''}"`,
      `"${expense.receiptNumber || ''}"`,
      expense.status || '',
      `"${expense.notes || ''}"`,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = async (data: Expense[]) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Expense Report', 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Add expenses
  let yPosition = 50;
  doc.setFontSize(10);
  
  data.forEach((expense, index) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${expense.title}`, 20, yPosition);
    doc.text(`Date: ${new Date(expense.expenseDate).toLocaleDateString()}`, 30, yPosition + 8);
    doc.text(`Category: ${expense.category}`, 30, yPosition + 16);
    doc.text(`Amount: ₹${expense.totalAmount.toFixed(2)}`, 30, yPosition + 24);
    doc.text(`Status: ${expense.status}`, 30, yPosition + 32);
    
    yPosition += 45;
  });
  
  doc.save(`expenses_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Types
interface Expense {
  id: string;
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  amount: number;
  expenseDate: Date | string;
  paymentMethod: string;
  vendor?: string;
  vendorContact?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedBy?: string;
  approvedAt?: Date | string;
  notes?: string;
  attachments?: string;
  budgetCategory?: string;
  isRecurring?: boolean;
  recurringType?: string;
  schoolId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  school?: {
    id: number;
    schoolName: string;
  };
}

interface ExpenseAnalytics {
  statusSummary: Array<{
    status: string;
    _sum: { totalAmount: number };
    _count: { id: number };
  }>;
  categorySummary: Array<{
    category: string;
    _sum: { totalAmount: number };
    _count: { id: number };
  }>;
  monthlyExpenses: Array<{
    month: number;
    total: number;
  }>;
  totalExpenses: number;
  totalCount: number;
}

interface ExpenseFormData {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  amount: string;
  expenseDate: string;
  paymentMethod: string;
  invoiceNumber: string;
  receiptNumber: string;
  taxAmount: string;
  discountAmount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  notes: string;
  budgetCategory: string;
  isRecurring: boolean;
  recurringType: string;
}

// Constants
const CATEGORIES = [
  'Stationery',
  'Utilities',
  'Transport',
  'Maintenance',
  'Salary',
  'Infrastructure',
  'Food & Catering',
  'Events & Activities',
  'Technology',
  'Sports & Equipment',
  'Medical & Health',
  'Marketing & Promotion',
  'Insurance',
  'Legal & Professional',
  'Miscellaneous'
];

const PAYMENT_METHODS = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card'];
const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'];

// Chart utility functions
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Stationery': '#4CAF50',
    'Utilities': '#2196F3',
    'Transport': '#FF9800',
    'Maintenance': '#FFC107',
    'Salary': '#F44336',
    'Infrastructure': '#9C27B0',
    'Food & Catering': '#795548',
    'Events & Activities': '#E91E63',
    'Technology': '#607D8B',
    'Sports & Equipment': '#00BCD4',
    'Medical & Health': '#8BC34A',
    'Marketing & Promotion': '#FF5722',
    'Insurance': '#3F51B5',
    'Legal & Professional': '#009688',
    'Miscellaneous': '#9E9E9E'
  };
  return colors[category] || '#9E9E9E';
};

const ExpenseTracker: React.FC = () => {
  // Chart refs
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    invoiceNumber: '',
    receiptNumber: '',
    taxAmount: '',
    discountAmount: '',
    status: 'PENDING',
    notes: '',
    budgetCategory: '',
    isRecurring: false,
    recurringType: ''
  });

  // Load data on component mount
  useEffect(() => {
    fetchExpenses();
    fetchAnalytics();
  }, [currentPage, filterCategory, filterStatus, searchTerm, startDate, endDate]);

  // Update charts when analytics change
  useEffect(() => {
    if (analytics) {
      renderCharts();
    }
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      destroyChart(barChartRef.current);
      destroyChart(pieChartRef.current);
      destroyChart(lineChartRef.current);
    };
  }, [analytics]);

  // Chart functions
  const destroyChart = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      const chart = Chart.getChart(canvas);
      if (chart) {
        chart.destroy();
      }
    }
  };

  const renderCharts = () => {
    if (!analytics) return;
    
    renderBarChart();
    renderPieChart();
    renderLineChart();
  };

  const renderBarChart = () => {
    if (barChartRef.current && analytics) {
      const barChartCtx = barChartRef.current.getContext('2d');
      
      destroyChart(barChartRef.current);
      
      if (barChartCtx) {
        const categories = analytics.categorySummary.map(item => item.category);
        const amounts = analytics.categorySummary.map(item => item._sum.totalAmount || 0);
        
        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [{
              label: 'Expenses by Category',
              data: amounts,
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
                  text: 'Amount (₹)'
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
                    return `₹${context.raw}`;
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
    if (pieChartRef.current && analytics) {
      const pieChartCtx = pieChartRef.current.getContext('2d');
      
      destroyChart(pieChartRef.current);
      
      if (pieChartCtx) {
        const categories = analytics.categorySummary.map(item => item.category);
        const amounts = analytics.categorySummary.map(item => item._sum.totalAmount || 0);
        
        const config: ChartConfiguration = {
          type: 'doughnut',
          data: {
            labels: categories,
            datasets: [{
              data: amounts,
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
                    const total = amounts.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${categories[context.dataIndex]}: ₹${value} (${percentage}%)`;
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
    if (lineChartRef.current && analytics) {
      const lineChartCtx = lineChartRef.current.getContext('2d');
      
      destroyChart(lineChartRef.current);
      
      if (lineChartCtx) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Create monthly data array (12 months)
        const monthlyData = new Array(12).fill(0);
        analytics.monthlyExpenses.forEach(item => {
          if (item.month >= 1 && item.month <= 12) {
            monthlyData[item.month - 1] = Number(item.total) || 0;
          }
        });
        
        const config: ChartConfiguration = {
          type: 'line',
          data: {
            labels: monthNames,
            datasets: [{
              label: `Monthly Expenses (${new Date().getFullYear()})`,
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
                  text: 'Amount (₹)'
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
                    return `₹${context.raw}`;
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

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiClient.get(`?${params}`);
      
      if (response.data.success) {
        setExpenses(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalCount(response.data.pagination.totalCount);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('category', filterCategory);
      
      const response = await apiClient.get(`/analytics/overview?${params}`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Calculate total amount (amount + tax - discount)
  const calculateTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    return amount + taxAmount - discountAmount;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.amount || !formData.expenseDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        taxAmount: parseFloat(formData.taxAmount) || 0,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        expenseDate: formData.expenseDate
        // Removed schoolId - backend gets it from authentication context
      };
      
      if (editingExpense) {
        // Update existing expense
        const response = await apiClient.put(`/${editingExpense.id}`, payload);
        if (response.data.success) {
          toast.success('Expense updated successfully');
          setEditingExpense(null);
          setIsEditModalOpen(false);
        }
      } else {
        // Create new expense
        const response = await apiClient.post('', payload);
        if (response.data.success) {
          toast.success('Expense created successfully');
        }
      }
      
      // Reset form and refresh data
      resetForm();
      fetchExpenses();
      fetchAnalytics();
      
    } catch (err) {
      console.error('Error saving expense:', err);
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || err.message
        : 'Failed to save expense';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      subCategory: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      invoiceNumber: '',
      receiptNumber: '',
      taxAmount: '',
      discountAmount: '',
      status: 'PENDING',
      notes: '',
      budgetCategory: '',
      isRecurring: false,
      recurringType: ''
    });
    setIsFormVisible(false);
    setEditingExpense(null);
  };

  // Handle view
  const handleView = (expense: Expense) => {
    setViewingExpense(expense);
    setIsViewModalOpen(true);
  };

  // Handle edit
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description || '',
      category: expense.category,
      subCategory: expense.subCategory || '',
      amount: expense.amount.toString(),
      expenseDate: typeof expense.expenseDate === 'string' 
        ? expense.expenseDate.split('T')[0] 
        : new Date(expense.expenseDate).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      invoiceNumber: expense.invoiceNumber || '',
      receiptNumber: expense.receiptNumber || '',
      taxAmount: expense.taxAmount?.toString() || '',
      discountAmount: expense.discountAmount?.toString() || '',
      status: expense.status,
      notes: expense.notes || '',
      budgetCategory: expense.budgetCategory || '',
      isRecurring: expense.isRecurring || false,
      recurringType: expense.recurringType || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.delete(`/${expenseToDelete}`);
      
      if (response.data.success) {
        toast.success('Expense deleted successfully');
        fetchExpenses();
        fetchAnalytics();
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        <div className="flex items-center space-x-4">
          {/* Export Buttons */}
          <button 
            onClick={() => exportToCSV(expenses)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => exportToPDF(expenses)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            {isFormVisible ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Expense
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form - positioned right after header */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-indigo-50 px-6 py-6 sm:px-8 border-b border-indigo-100 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-indigo-800 mb-4">Add New Expense</h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
              </div>
              
                {/* Expense Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
              </div>
              
                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Receipt Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tax Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (₹)</label>
                  <input
                    type="number"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Discount Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (₹)</label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Total Amount Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <div className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-lg font-semibold text-green-600">
                    ₹{calculateTotalAmount().toFixed(2)}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
              
                {/* Notes */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Form Buttons */}
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4">
                <button 
                  type="button" 
                    onClick={resetForm}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold">₹{analytics.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-blue-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              </div>
            </div>
            
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold">{analytics.totalCount}</p>
              </div>
              <div className="bg-green-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
          </div>
        </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold">
                  {analytics.statusSummary.find(s => s.status === 'PENDING')?._count?.id || 0}
                </p>
              </div>
              <div className="bg-yellow-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            </div>
            
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">
                  {analytics.statusSummary.find(s => s.status === 'APPROVED')?._count?.id || 0}
                </p>
              </div>
              <div className="bg-purple-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
              </div>
            )}
            
      {/* Charts Section */}
      {analytics && (
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
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Monthly Expense Trends ({new Date().getFullYear()})</h3>
            <div className="h-64">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
              </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterStatus('');
              setStartDate('');
              setEndDate('');
              setCurrentPage(1);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300 ease-in-out"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Expenses table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && expenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading expenses...</p>
          </div>
        ) : expenses.length > 0 ? (
          <>
              <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                        </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{expense.title}</div>
                            {expense.description && (
                            <div className="text-xs text-gray-500">{expense.description}</div>
                            )}
                          </div>
                        </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{expense.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : expense.status === 'PAID'
                            ? 'bg-blue-100 text-blue-800'
                            : expense.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status}
                          </span>
                        </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleView(expense)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, totalCount)}
                      </span>{' '}
                      of <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {isLoading ? 'Loading expenses...' : 'No expenses found.'}
            </p>
          </div>
        )}
        </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Expense</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingExpense(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
      </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Receipt Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tax Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (₹)</label>
                <input
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (₹)</label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Total Amount Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <div className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-lg font-semibold text-green-600">
                  ₹{calculateTotalAmount().toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingExpense(null);
                    resetForm();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Expense</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setExpenseToDelete(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingExpense && isViewModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Expense Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Title</label>
                    <p className="text-gray-900 font-medium">{viewingExpense.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Category</label>
                    <p className="text-gray-900">{viewingExpense.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewingExpense.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : viewingExpense.status === 'PAID'
                        ? 'bg-blue-100 text-blue-800'
                        : viewingExpense.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingExpense.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Date</label>
                    <p className="text-gray-900">{new Date(viewingExpense.expenseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Financial Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Base Amount</label>
                    <p className="text-gray-900 font-medium">₹{viewingExpense.amount.toFixed(2)}</p>
                  </div>
                  {viewingExpense.taxAmount && viewingExpense.taxAmount > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Tax Amount</label>
                      <p className="text-gray-900">₹{viewingExpense.taxAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {viewingExpense.discountAmount && viewingExpense.discountAmount > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Discount</label>
                      <p className="text-red-600">-₹{viewingExpense.discountAmount.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-lg font-bold text-green-600">₹{viewingExpense.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-gray-900">{viewingExpense.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                  Additional Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Invoice Number</label>
                    <p className="text-gray-900">{viewingExpense.invoiceNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Receipt Number</label>
                    <p className="text-gray-900">{viewingExpense.receiptNumber || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and Notes */}
            {(viewingExpense.description || viewingExpense.notes) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingExpense.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                      </svg>
                      Description
                    </h3>
                    <p className="text-gray-700">{viewingExpense.description}</p>
                  </div>
                )}
                {viewingExpense.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                      Notes
                    </h3>
                    <p className="text-gray-700">{viewingExpense.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  handleEdit(viewingExpense);
                  setIsViewModalOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                Edit Expense
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition duration-300 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;