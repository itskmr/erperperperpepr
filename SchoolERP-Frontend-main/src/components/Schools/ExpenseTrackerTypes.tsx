// ExpenseTrackerTypes.tsx
export interface Expense {
    id: string;
    title: string;
    amount: number;
    date: Date;
    category: string;
    description: string;
  }
  
  export interface CategoryInfo {
    icon: string;
    color: string;
    label: string;
  }
  
  export const CATEGORIES: Record<string, CategoryInfo> = {
    supplies: {
      icon: '📚',
      color: '#4CAF50',
      label: 'School Supplies'
    },
    equipment: {
      icon: '🖥️',
      color: '#2196F3',
      label: 'Equipment'
    },
    maintenance: {
      icon: '🔧',
      color: '#FFC107',
      label: 'Maintenance'
    },
    utilities: {
      icon: '💡',
      color: '#9C27B0',
      label: 'Utilities'
    },
    salaries: {
      icon: '👨‍🏫',
      color: '#F44336',
      label: 'Salaries'
    },
    events: {
      icon: '🎉',
      color: '#FF9800',
      label: 'Events'
    },
    transportation: {
      icon: '🚌',
      color: '#795548',
      label: 'Transportation'
    },
    other: {
      icon: '📋',
      color: '#607D8B',
      label: 'Other'
    }
  };
  
  export const getCategoryIcon = (category: string): string => {
    return CATEGORIES[category]?.icon || CATEGORIES.other.icon;
  };
  
  export const getCategoryColor = (category: string): string => {
    return CATEGORIES[category]?.color || CATEGORIES.other.color;
  };
  
  export const getCategoryLabel = (category: string): string => {
    return CATEGORIES[category]?.label || 'Other';
  };
  
  export const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];