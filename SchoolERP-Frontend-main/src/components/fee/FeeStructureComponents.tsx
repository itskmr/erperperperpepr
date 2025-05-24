import React from 'react';
import { Plus, Edit2, Trash2, Save, Search, Filter, ArrowUpDown, X } from 'lucide-react';

// Styled button component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  className = '',
  disabled = false
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const baseStyles = 'rounded-md font-medium focus:outline-none transition-colors flex items-center justify-center';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Input component
export const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  className = ''
}: {
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <div className="relative">
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md ${icon ? 'pl-10' : 'px-3'} py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    />
  </div>
);

// Badge component
export const Badge = ({ 
  children, 
  color = 'blue'
}: {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'cyan' | 'pink' | 'orange';
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    pink: 'bg-pink-100 text-pink-800',
    orange: 'bg-orange-100 text-orange-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

// Loading spinner component
export const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      <p className="mt-4 text-gray-700">{message}</p>
    </div>
  </div>
);

// Error message component
export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
    {message}
  </div>
);

// Filter section component
export interface FilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterFrequency: string;
  setFilterFrequency: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  categories: string[];
  clearFilters: () => void;
  toggleSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  frequencyOptions?: string[];
}

export const FilterSection = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterFrequency,
  setFilterFrequency,
  isFilterOpen,
  setIsFilterOpen,
  categories,
  clearFilters,
  toggleSort,
  sortField,
  sortDirection,
  frequencyOptions = ['Monthly', 'Bi-Monthly', 'Quarterly', 'Half-Yearly', 'Term-Wise', 'Yearly', 'One-Time']
}: FilterProps) => (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search by class name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5 text-gray-400" />}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleSort('totalAnnualFee')}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {sortField === 'totalAnnualFee' 
            ? `Annual Fee ${sortDirection === 'asc' ? '↑' : '↓'}` 
            : 'Annual Fee'}
        </Button>
      </div>
    </div>
    
    {/* Expanded filter options */}
    {isFilterOpen && (
      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ appearance: 'auto' }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ appearance: 'auto' }}
            >
              <option value="">All Frequencies</option>
              {frequencyOptions.map(frequency => (
                <option key={frequency} value={frequency}>{frequency}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="text-red-600 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
); 