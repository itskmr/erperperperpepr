export interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'One-Time' | 'Term-Wise' | 'Bi-Monthly';
  description?: string;
}

export interface ClassFeeStructure {
  id: string;
  className: string;
  totalAnnualFee: number;
  categories: FeeCategory[];
  description?: string;
  schoolId?: number;
}

// Default fee categories for selection
export const DEFAULT_CATEGORIES = [
  'Registration Fee',
  'Admission Fee',
  'Tuition Fee',
  'Monthly Fee',
  'Annual Charges',
  'Development Fund',
  'Computer Lab Fee',
  'Transport Fee',
  'Library Fee',
  'Laboratory Fee',
  'Sports Fee',
  'Readmission Charge',
  'PTA Fee',
  'Smart Class Fee',
  'Security and Safety Fee',
  'Activities Fee',
  'Examination Fee',
  'Maintenance Fee'
];

// Function to calculate the total annual fee
export const calculateTotalAnnualFee = (categories: FeeCategory[]): number => {
  return categories.reduce((total, category) => {
    const multiplier = 
      category.frequency === 'Monthly' ? 12 : 
      category.frequency === 'Bi-Monthly' ? 6 :
      category.frequency === 'Quarterly' ? 4 : 
      category.frequency === 'Half-Yearly' ? 2 :
      category.frequency === 'Term-Wise' ? 3 :
      category.frequency === 'One-Time' ? 1 :
      1; // Default to 1 for Yearly or any other frequency
    return total + (category.amount * multiplier);
  }, 0);
}; 