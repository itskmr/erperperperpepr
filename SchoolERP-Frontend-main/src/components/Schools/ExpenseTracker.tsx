// ExpenseTracker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Expense, 
  getCategoryIcon, 
  getCategoryColor, 
  getCategoryLabel, 
  CATEGORIES,
  months 
} from './ExpenseTrackerTypes';
import ExpenseCharts from './ExpenseCharts';
import { format } from 'date-fns';

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredYear, setFilteredYear] = useState<string>(new Date().getFullYear().toString());
  const [filteredMonth, setFilteredMonth] = useState<string>('all');
 
  // Form states
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('supplies');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Load expenses from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('schoolExpenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      setExpenses(parsedExpenses);
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schoolExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // Filter expenses based on selected year and month
  const filteredExpenses = expenses.filter((expense) => {
    const expenseYear = expense.date.getFullYear().toString();
    const expenseMonth = expense.date.getMonth().toString();
   
    if (filteredMonth === 'all') {
      return expenseYear === filteredYear;
    } else {
      return expenseYear === filteredYear && expenseMonth === filteredMonth;
    }
  });

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (title.trim().length === 0) {
      errors.title = 'Title is required';
    }
    
    if (amount.trim().length === 0) {
      errors.amount = 'Amount is required';
    } else if (isNaN(+amount) || +amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (date.trim().length === 0) {
      errors.date = 'Date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new expense
  const addExpenseHandler = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newExpense: Expense = {
      id: Math.random().toString(),
      title,
      amount: +amount,
      date: new Date(date),
      category,
      description
    };

    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
   
    // Reset form
    setTitle('');
    setAmount('');
    setDate('');
    setCategory('supplies');
    setDescription('');
    setIsFormVisible(false);
  };

  // Delete expense
  const deleteExpenseHandler = (id: string) => {
    setExpenses((prevExpenses) => prevExpenses.filter(expense => expense.id !== id));
  };

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
 
  // Calculate category totals
  const categoryTotals = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  // Find highest expense
  const highestExpense = filteredExpenses.length > 0
    ? filteredExpenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current)
    : null;

  // Monthly expenses for trend chart
  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0);
    
    expenses
      .filter(expense => expense.date.getFullYear().toString() === filteredYear)
      .forEach(expense => {
        const month = expense.date.getMonth();
        monthlyData[month] += expense.amount;
      });
      
    return monthlyData;
  };

  // Available years for filtering
  const yearOptions = [...new Set(expenses.map(expense => expense.date.getFullYear().toString()))];
  if (yearOptions.length === 0) {
    yearOptions.push(new Date().getFullYear().toString());
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <header className="bg-blue-600 text-white p-6 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">School Expense Tracker</h1>
          <button 
            className="mt-4 md:mt-0 bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md font-medium transition-colors duration-200"
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            {isFormVisible ? 'Cancel' : 'Add New Expense'}
          </button>
        </header>

        {isFormVisible && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Expense</h2>
            <form onSubmit={addExpenseHandler}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.amount}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORIES).map(([value, { icon, label }]) => (
                      <option key={value} value={value}>
                        {icon} {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormVisible(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <label htmlFor="year" className="text-sm font-medium text-gray-700 mr-2">
                  Year:
                </label>
                <select
                  id="year"
                  value={filteredYear}
                  onChange={(e) => setFilteredYear(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="month" className="text-sm font-medium text-gray-700 mr-2">
                  Month:
                </label>
                <select
                  id="month"
                  value={filteredMonth}
                  onChange={(e) => setFilteredMonth(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-md border border-blue-200">
              <span className="text-sm font-medium text-gray-700 mr-2">Total:</span>
              <span className="text-xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Total Expenses</h3>
              <p className="text-3xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">
                {filteredMonth === 'all' 
                  ? `For ${filteredYear}` 
                  : `For ${months.find(m => m.value === filteredMonth)?.label.replace('All ', '')} ${filteredYear}`}
              </p>
            </div>
            
            {highestExpense && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Highest Expense</h3>
                <p className="text-lg font-medium text-gray-800">{highestExpense.title}</p>
                <p className="text-3xl font-bold text-amber-500">₹{highestExpense.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(highestExpense.date, 'MMM d, yyyy')} • {getCategoryIcon(highestExpense.category)} {getCategoryLabel(highestExpense.category)}
                </p>
              </div>
            )}
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Number of Expenses</h3>
              <p className="text-3xl font-bold text-green-600">{filteredExpenses.length}</p>
              <p className="text-sm text-gray-500 mt-2">
                {filteredMonth === 'all' 
                  ? `For ${filteredYear}` 
                  : `For ${months.find(m => m.value === filteredMonth)?.label.replace('All ', '')} ${filteredYear}`}
              </p>
            </div>
          </div>

          {/* Using the separate ExpenseCharts component */}
          <ExpenseCharts 
            categoryTotals={categoryTotals}
            monthlyData={getMonthlyData()}
            filteredYear={filteredYear}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <h3 className="text-lg font-semibold text-gray-700 p-5 border-b border-gray-200">Expenses List</h3>
            
            {filteredExpenses.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No expenses found for the selected period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(expense.date, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{expense.title}</span>
                            {expense.description && (
                              <div className="ml-2 group relative">
                                <span className="cursor-help text-gray-400">ℹ️</span>
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48 pointer-events-none transition-opacity duration-200 z-10">
                                  {expense.description}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ 
                            backgroundColor: `${getCategoryColor(expense.category)}20`,
                            color: getCategoryColor(expense.category)
                          }}>
                            {getCategoryIcon(expense.category)} {getCategoryLabel(expense.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={() => deleteExpenseHandler(expense.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;