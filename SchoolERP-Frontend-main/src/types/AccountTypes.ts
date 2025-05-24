// AccountTypes.ts - Type definitions for account management

export enum AccountType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  ASSETS = 'Assets',
  LIABILITY = 'Liability'
}

export enum ClassLevel {
  NURSERY = 'Nursery',
  PREP = 'Prep',
  CLASS_1 = 'Class 1',
  CLASS_2 = 'Class 2',
  CLASS_3 = 'Class 3',
  CLASS_4 = 'Class 4',
  CLASS_5 = 'Class 5',
  CLASS_6 = 'Class 6',
  CLASS_7 = 'Class 7',
  CLASS_8 = 'Class 8',
  CLASS_9 = 'Class 9',
  CLASS_10 = 'Class 10',
  CLASS_11 = 'Class 11',
  CLASS_12 = 'Class 12',
  ALL_CLASSES = 'All Classes',
  NONE = 'None'
}

export interface Account {
  id: number;
  accountName: string;
  accountType: AccountType;
  opBalance: number;
  associatedClass?: ClassLevel;
  description?: string;
  createdAt: Date;
  lastUpdated?: Date;
  isActive: boolean;
}

export interface AccountFormData {
  accountName: string;
  accountType: AccountType;
  opBalance: number;
  associatedClass: ClassLevel;
  description: string;
  isActive: boolean;
}

export interface AccountFilters {
  searchTerm: string;
  accountType: string;
  classLevel: string;
  showInactive: boolean;
}

// Categories of accounts typically used in educational institutions
export enum AccountCategory {
  TUITION_FEE = 'Tuition Fee',
  ADMISSION_FEE = 'Admission Fee',
  EXAMINATION_FEE = 'Examination Fee',
  LIBRARY_FEE = 'Library Fee',
  TRANSPORTATION_FEE = 'Transportation Fee',
  STAFF_SALARY = 'Staff Salary',
  UTILITIES = 'Utilities',
  INFRASTRUCTURE = 'Infrastructure',
  OPERATING_EXPENSES = 'Operating Expenses',
  SPORTS_ACTIVITIES = 'Sports & Activities',
  SCHOLARSHIPS = 'Scholarships',
  GENERAL = 'General'
}

// Sample initial accounts data with class associations
export const initialAccounts: Account[] = [
  { 
    id: 1, 
    accountName: 'Application Form', 
    accountType: AccountType.INCOME, 
    opBalance: 500.00, 
    associatedClass: ClassLevel.ALL_CLASSES,
    description: 'Income from application form sales',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 2, 
    accountName: 'Admission', 
    accountType: AccountType.INCOME, 
    opBalance: 200.00,
    associatedClass: ClassLevel.ALL_CLASSES,
    description: 'New student admission fees',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 3, 
    accountName: 'Cash', 
    accountType: AccountType.ASSETS, 
    opBalance: 0.00,
    associatedClass: ClassLevel.NONE,
    description: 'Cash in hand',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 4, 
    accountName: 'Nursery Class Fees', 
    accountType: AccountType.INCOME, 
    opBalance: 0.00,
    associatedClass: ClassLevel.NURSERY,
    description: 'Monthly tuition fees for Nursery class',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 5, 
    accountName: 'Secondary Classes Lab Expenses', 
    accountType: AccountType.EXPENSE, 
    opBalance: 0.00,
    associatedClass: ClassLevel.CLASS_9,
    description: 'Laboratory equipment and supplies for secondary classes',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 6, 
    accountName: 'School Bus Maintenance', 
    accountType: AccountType.EXPENSE, 
    opBalance: 0.00,
    associatedClass: ClassLevel.NONE, 
    description: 'Regular maintenance of school transportation vehicles',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 7, 
    accountName: 'Library Books Purchase', 
    accountType: AccountType.EXPENSE, 
    opBalance: 0.00,
    associatedClass: ClassLevel.ALL_CLASSES,
    description: 'Purchase of new books for school library',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 8, 
    accountName: 'Teacher Salaries', 
    accountType: AccountType.EXPENSE, 
    opBalance: 0.00,
    associatedClass: ClassLevel.NONE,
    description: 'Monthly salaries for teaching staff',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 9, 
    accountName: 'Online Payments', 
    accountType: AccountType.INCOME, 
    opBalance: 5000.00,
    associatedClass: ClassLevel.ALL_CLASSES,
    description: 'Income from online fee payments',
    createdAt: new Date('2023-01-01'),
    isActive: true
  },
  { 
    id: 10, 
    accountName: 'Class 12 Science Lab', 
    accountType: AccountType.EXPENSE, 
    opBalance: 0.00,
    associatedClass: ClassLevel.CLASS_12,
    description: 'Science laboratory expenses specific to Class 12',
    createdAt: new Date('2023-01-01'),
    isActive: true
  }
];

// Helper functions
export const getClassLevelLabel = (classLevel: ClassLevel): string => {
  return classLevel;
};

export const getAccountTypeColor = (type: AccountType): string => {
  switch (type) {
    case AccountType.INCOME:
      return 'bg-green-100 text-green-800';
    case AccountType.EXPENSE:
      return 'bg-red-100 text-red-800';
    case AccountType.ASSETS:
      return 'bg-blue-100 text-blue-800';
    case AccountType.LIABILITY:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 