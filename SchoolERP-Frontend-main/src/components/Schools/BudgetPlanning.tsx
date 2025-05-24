// BudgetPlanning.tsx

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback, useMemo } from 'react';

// Define TypeScript interfaces
interface BudgetCategory {
  id: number;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  description?: string;
  department?: string;
}

interface ExpenseData {
  category: string;
  amount: string;
  description: string;
  date: string;
  paymentMethod?: string;
  vendor?: string;
  receiptNumber?: string;
  approvedBy?: string;
}

interface ExpenseRecord {
  id: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  vendor?: string;
  receiptNumber?: string;
  approvedBy?: string;
  timestamp: number;
}

interface BudgetFilter {
  department: string;
  fiscalQuarter: string;
  minAmount: string;
  maxAmount: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

const BudgetPlanning: React.FC = () => {
  // State for budget data
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear());
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { id: 1, name: 'Salaries', allocated: 2500000, spent: 1200000, remaining: 1300000, department: 'Administration' },
    { id: 2, name: 'Facilities', allocated: 800000, spent: 450000, remaining: 350000, department: 'Operations' },
    { id: 3, name: 'Educational Materials', allocated: 600000, spent: 320000, remaining: 280000, department: 'Academics' },
    { id: 4, name: 'Technology', allocated: 500000, spent: 180000, remaining: 220000, department: 'IT' },
    { id: 5, name: 'Extracurricular', allocated: 300000, spent: 120000, remaining: 180000, department: 'Student Affairs' },
    { id: 6, name: 'Administrative', allocated: 450000, spent: 210000, remaining: 240000, department: 'Administration' },
  ]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDepartment, setNewCategoryDepartment] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'reports' | 'settings'>('overview');
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().substr(0, 10),
    paymentMethod: 'Cash',
    vendor: '',
    receiptNumber: '',
    approvedBy: '',
  });
  const [expenseHistory, setExpenseHistory] = useState<ExpenseRecord[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<BudgetFilter>({
    department: '',
    fiscalQuarter: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [selectedDepartmentForChart, setSelectedDepartmentForChart] = useState<string>('All');
  const [chartView, setChartView] = useState<'spending' | 'allocation'>('spending');

  const departments = useMemo(() => {
    const depts = new Set<string>();
    budgetCategories.forEach(cat => {
      if (cat.department) {
        depts.add(cat.department);
      }
    });
    return ['All', ...Array.from(depts)];
  }, [budgetCategories]);

  // Calculate totals and remaining budget
  useEffect(() => {
    const allocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    const spent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    setTotalBudget(allocated);
    
    // Check for budget alerts
    const newAlerts: string[] = [];
    budgetCategories.forEach(cat => {
      const percentSpent = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
      if (percentSpent > 90 && cat.allocated > 0) {
        newAlerts.push(`Warning: ${cat.name} budget is over 90% utilized.`);
      } else if (percentSpent > 75 && cat.allocated > 0) {
        newAlerts.push(`Alert: ${cat.name} budget is over 75% utilized.`);
      }
      
      if (cat.remaining < 0) {
        newAlerts.push(`Critical: ${cat.name} has exceeded its budget allocation.`);
      }
    });
    setAlerts(newAlerts);
  }, [budgetCategories]);

  // Update remaining values when allocated or spent changes
  useEffect(() => {
    const updatedCategories = budgetCategories.map(cat => ({
      ...cat,
      remaining: cat.allocated - cat.spent
    }));
    setBudgetCategories(updatedCategories);
  }, [budgetCategories.map(cat => cat.allocated + cat.spent).join(',')]);

  // Handle allocation change
  const handleAllocationChange = (id: number, value: string): void => {
    const amount = parseFloat(value) || 0;
    const updatedCategories = budgetCategories.map(cat => 
      cat.id === id ? { ...cat, allocated: amount, remaining: amount - cat.spent } : cat
    );
    setBudgetCategories(updatedCategories);
  };

  // Add new category
  const handleAddCategory = (): void => {
    if (!newCategoryName.trim()) return;
    
    const newId = Math.max(...budgetCategories.map(cat => cat.id), 0) + 1;
    setBudgetCategories([
      ...budgetCategories,
      { 
        id: newId, 
        name: newCategoryName, 
        allocated: 0, 
        spent: 0, 
        remaining: 0,
        department: newCategoryDepartment,
        description: newCategoryDescription
      }
    ]);
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryDepartment('');
    setNewCategoryDescription('');
    setShowAddCategory(false);
  };

  // Delete category
  const handleDeleteCategory = (id: number): void => {
    setBudgetCategories(budgetCategories.filter(cat => cat.id !== id));
  };

  // Handle expense submission
  const handleExpenseSubmit = (e: FormEvent): void => {
    e.preventDefault();
    
    if (!expenseData.category || !expenseData.amount) return;
    
    const amount = parseFloat(expenseData.amount);
    const categoryId = parseInt(expenseData.category);
    
    // Update the spent amount for the category
    const updatedCategories = budgetCategories.map(cat => 
      cat.id === categoryId
        ? { ...cat, spent: cat.spent + amount, remaining: cat.allocated - (cat.spent + amount) } 
        : cat
    );
    
    // Add to expense history
    const categoryName = budgetCategories.find(
      cat => cat.id === categoryId
    )?.name || '';
    
    const newExpense: ExpenseRecord = {
      id: Date.now(),
      categoryId,
      categoryName,
      amount,
      description: expenseData.description,
      date: expenseData.date,
      paymentMethod: expenseData.paymentMethod,
      vendor: expenseData.vendor,
      receiptNumber: expenseData.receiptNumber,
      approvedBy: expenseData.approvedBy,
      timestamp: Date.now(),
    };
    
    setExpenseHistory([newExpense, ...expenseHistory]);
    setBudgetCategories(updatedCategories);
    
    // Reset form
    setExpenseData({
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().substr(0, 10),
      paymentMethod: 'Cash',
      vendor: '',
      receiptNumber: '',
      approvedBy: '',
    });
    
    setShowAddExpense(false);
  };

  // Start editing a category
  const startEditing = (category: BudgetCategory): void => {
    setIsEditing(category.id);
  };

  // Save edited category
  const saveEditing = (): void => {
    setIsEditing(null);
  };

  // Get percentage spent for a category
  const getPercentSpent = (category: BudgetCategory): number => {
    if (category.allocated === 0) return 0;
    return Math.round((category.spent / category.allocated) * 100);
  };

  // Get color class based on budget utilization
  const getUtilizationColorClass = (percent: number): string => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    if (percent >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get alert level class
  const getAlertLevelClass = (percent: number): string => {
    if (percent >= 90) return 'text-red-600 font-semibold';
    if (percent >= 75) return 'text-yellow-600 font-semibold';
    return 'text-gray-900';
  };

  // Handle search
  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Reset filters
  const resetFilters = (): void => {
    setFilters({
      department: '',
      fiscalQuarter: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Handle sorting
  const requestSort = (key: string): void => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered categories
  const getSortedAndFilteredCategories = useCallback((): BudgetCategory[] => {
    let filteredCategories = [...budgetCategories];
    
    // Apply search
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredCategories = filteredCategories.filter(
        cat => cat.name.toLowerCase().includes(lowerCaseSearchTerm) || 
               (cat.department && cat.department.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    
    // Apply filters
    if (filters.department) {
      filteredCategories = filteredCategories.filter(
        cat => cat.department === filters.department
      );
    }
    
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filteredCategories = filteredCategories.filter(
        cat => cat.allocated >= minAmount
      );
    }
    
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filteredCategories = filteredCategories.filter(
        cat => cat.allocated <= maxAmount
      );
    }
    
    // // Apply sorting
    // if (sortConfig) {
    //   filteredCategories.sort((a, b) => {
    //     if (a[sortConfig.key as keyof BudgetCategory] < b[sortConfig.key as keyof BudgetCategory]) {
    //       return sortConfig.direction === 'ascending' ? -1 : 1;
    //     }
    //     if (a[sortConfig.key as keyof BudgetCategory] > b[sortConfig.key as keyof BudgetCategory]) {
    //       return sortConfig.direction === 'ascending' ? 1 : -1;
    //     }
    //     return 0;
    //   });
    // }
    
    return filteredCategories;
  }, [budgetCategories, searchTerm, filters, sortConfig]);

  // Get filtered expenses
  const getFilteredExpenses = useCallback((): ExpenseRecord[] => {
    let filteredExpenses = [...expenseHistory];
    
    // Apply search
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredExpenses = filteredExpenses.filter(
        expense => 
          expense.categoryName.toLowerCase().includes(lowerCaseSearchTerm) ||
          expense.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          (expense.vendor && expense.vendor.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    
    // Apply filters
    if (filters.fiscalQuarter) {
      // Assuming fiscal quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
      const quarterMonths = {
        'Q1': [3, 4, 5], // Apr-Jun
        'Q2': [6, 7, 8], // Jul-Sep
        'Q3': [9, 10, 11], // Oct-Dec
        'Q4': [0, 1, 2], // Jan-Mar
      };
      
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth();
        return quarterMonths[filters.fiscalQuarter as keyof typeof quarterMonths].includes(expenseMonth);
      });
    }
    
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filteredExpenses = filteredExpenses.filter(
        expense => expense.amount >= minAmount
      );
    }
    
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filteredExpenses = filteredExpenses.filter(
        expense => expense.amount <= maxAmount
      );
    }
    
    if (filters.department) {
      const categoryIds = budgetCategories
        .filter(cat => cat.department === filters.department)
        .map(cat => cat.id);
      
      filteredExpenses = filteredExpenses.filter(
        expense => categoryIds.includes(expense.categoryId)
      );
    }
    
    return filteredExpenses;
  }, [expenseHistory, searchTerm, filters, budgetCategories]);

  // Generate chart data
  const generateChartData = useMemo((): ChartData => {
    let relevantCategories = [...budgetCategories];
    
    if (selectedDepartmentForChart !== 'All') {
      relevantCategories = relevantCategories.filter(
        cat => cat.department === selectedDepartmentForChart
      );
    }
    
    // For spending chart
    const labels = relevantCategories.map(cat => cat.name);
    const spendingData = relevantCategories.map(cat => cat.spent);
    const allocatedData = relevantCategories.map(cat => cat.allocated);
    
    // Generate background colors (different for each category)
    const backgroundColors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 199, 199, 0.6)',
    ];
    
    // Ensure we have enough colors
    while (backgroundColors.length < labels.length) {
      backgroundColors.push(...backgroundColors);
    }
    
    return {
      labels,
      datasets: [
        {
          label: chartView === 'spending' ? 'Expenditure' : 'Budget Allocation',
          data: chartView === 'spending' ? spendingData : allocatedData,
          backgroundColor: backgroundColors.slice(0, labels.length),
        },
      ],
    };
  }, [budgetCategories, selectedDepartmentForChart, chartView]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate fiscal quarter
  const getCurrentFiscalQuarter = (): string => {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 3 && month <= 5) return 'Q1'; // Apr-Jun
    if (month >= 6 && month <= 8) return 'Q2'; // Jul-Sep
    if (month >= 9 && month <= 11) return 'Q3'; // Oct-Dec
    return 'Q4'; // Jan-Mar
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (id: number): void => {
    if (expandedCategory === id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(id);
    }
  };

  // Calculate department totals
  const getDepartmentTotals = useMemo(() => {
    const totals: Record<string, { allocated: number; spent: number; remaining: number }> = {};
    
    departments.forEach(dept => {
      if (dept !== 'All') {
        const deptCategories = budgetCategories.filter(cat => cat.department === dept);
        totals[dept] = {
          allocated: deptCategories.reduce((sum, cat) => sum + cat.allocated, 0),
          spent: deptCategories.reduce((sum, cat) => sum + cat.spent, 0),
          remaining: deptCategories.reduce((sum, cat) => sum + cat.remaining, 0),
        };
      }
    });
    
    return totals;
  }, [budgetCategories, departments]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Budget Planning</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Fiscal Year:</span>
                <select
                  value={fiscalYear}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiscalYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Quarter:</span>
                <span className="font-medium text-blue-600">{getCurrentFiscalQuarter()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 space-y-4 sm:space-y-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white border border-gray-300 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filters
              </button>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Record Expense
              </button>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Category
              </button>
            </div>
          </div>
        </header>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter Options</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.filter(dept => dept !== 'All').map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Quarter</label>
                <select
                  name="fiscalQuarter"
                  value={filters.fiscalQuarter}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Quarters</option>
                  <option value="Q1">Q1 (Apr-Jun)</option>
                  <option value="Q2">Q2 (Jul-Sep)</option>
                  <option value="Q3">Q3 (Oct-Dec)</option>
                  <option value="Q4">Q4 (Jan-Mar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₹)</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="Min amount"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₹)</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="Max amount"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-4 mb-2 rounded-md ${
                  alert.startsWith('Critical') 
                    ? 'bg-red-100 border-l-4 border-red-500 text-red-700' 
                    : alert.startsWith('Warning') 
                      ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
                      : 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
                }`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{alert}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Budget</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
            <p className="text-sm text-gray-500 mt-2">Fiscal Year {fiscalYear}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.spent, 0))}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round((budgetCategories.reduce((sum, cat) => sum + cat.spent, 0) / totalBudget) * 100)}% of total budget
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0))}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round((budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0) / totalBudget) * 100)}% of total budget
            </p>
          </div>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Record New Expense</h2>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    value={expenseData.category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                      setExpenseData({...expenseData, category: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {budgetCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.department ? `${cat.department} - ` : ''}₹{cat.remaining.toLocaleString('en-IN')} remaining)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={expenseData.amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, amount: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={expenseData.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, date: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={expenseData.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, description: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={expenseData.paymentMethod}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                      setExpenseData({...expenseData, paymentMethod: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Payee</label>
                  <input
                    type="text"
                    value={expenseData.vendor || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, vendor: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={expenseData.receiptNumber || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, receiptNumber: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter receipt number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <input
                    type="text"
                    value={expenseData.approvedBy || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setExpenseData({...expenseData, approvedBy: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter approver's name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Budget Category</h2>
              <button
                onClick={() => setShowAddCategory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newCategoryDepartment}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewCategoryDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.filter(dept => dept !== 'All').map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCategoryDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddCategory(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!newCategoryName.trim()}
              >
                Add Category
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Budget Overview
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expense History
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Budget Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Department Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.filter(dept => dept !== 'All').map((dept) => {
                  const deptData = getDepartmentTotals[dept];
                  if (!deptData) return null;
                  
                  const percentSpent = deptData.allocated > 0 
                    ? Math.round((deptData.spent / deptData.allocated) * 100) 
                    : 0;
                  
                  return (
                    <div key={dept} className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-800">{dept}</h4>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          percentSpent > 90 ? 'bg-red-100 text-red-800' : 
                          percentSpent > 75 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {percentSpent}% Used
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Allocated:</span>
                          <span className="font-medium">{formatCurrency(deptData.allocated)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Spent:</span>
                          <span className="font-medium">{formatCurrency(deptData.spent)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Remaining:</span>
                          <span className={`font-medium ${deptData.remaining < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(deptData.remaining)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUtilizationColorClass(percentSpent)}`}
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Budget Categories</h3>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <button 
                    onClick={() => requestSort('name')}
                    className={`text-sm mr-2 ${sortConfig?.key === 'name' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}
                  >
                    Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </button>
                  <button 
                    onClick={() => requestSort('allocated')}
                    className={`text-sm mr-2 ${sortConfig?.key === 'allocated' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}
                  >
                    Allocated {sortConfig?.key === 'allocated' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </button>
                  <button 
                    onClick={() => requestSort('remaining')}
                    className={`text-sm ${sortConfig?.key === 'remaining' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}
                  >
                    Remaining {sortConfig?.key === 'remaining' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedAndFilteredCategories().map((category) => (
                    <React.Fragment key={category.id}>
                      <tr className={expandedCategory === category.id ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => toggleCategoryExpansion(category.id)}
                              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              {expandedCategory === category.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.department || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing === category.id ? (
                            <input
                              type="number"
                              value={category.allocated}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                                handleAllocationChange(category.id, e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                              min="0"
                              step="0.01"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{formatCurrency(category.allocated)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(category.spent)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${category.remaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                            {formatCurrency(category.remaining)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${getUtilizationColorClass(getPercentSpent(category))}`}
                              style={{ width: `${Math.min(getPercentSpent(category), 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{getPercentSpent(category)}% used</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isEditing === category.id ? (
                            <button onClick={saveEditing} className="text-blue-600 hover:text-blue-900 mr-3">
                              Save
                            </button>
                          ) : (
                            <button onClick={() => startEditing(category)} className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                          )}
                          <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedCategory === category.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-blue-50">
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-2">Category Details:</p>
                              <p className="text-gray-600 mb-2">
                                <span className="font-medium">Description:</span> {category.description || 'No description provided'}
                              </p>
                              <div className="mt-3">
                                <p className="font-medium text-gray-700 mb-2">Recent Expenses:</p>
                                {expenseHistory.filter(exp => exp.categoryId === category.id).slice(0, 3).length > 0 ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {expenseHistory.filter(exp => exp.categoryId === category.id).slice(0, 3).map(expense => (
                                      <li key={expense.id} className="text-gray-600">
                                        {new Date(expense.date).toLocaleDateString()} - {formatCurrency(expense.amount)} - {expense.description || 'No description'}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 italic">No recent expenses found for this category.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Expense History Tab */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {getFilteredExpenses().length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No expense records found. Click "Record Expense" to add a new expense.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredExpenses().map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.vendor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.paymentMethod || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      Total:
                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(
                        getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BudgetPlanning;
