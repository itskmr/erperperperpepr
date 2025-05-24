import { VALIDATION_PATTERNS, StudentFormData } from './StudentFormTypes';

// List of required fields in the student form
const REQUIRED_FIELDS = [
  'admissionNo', 
  'fullName', 
  'admissionDate', 
  'dateOfBirth', 
  'gender', 
  'className', 
  'mobileNumber',
  'address.city', 
  'address.state', 
  'father.name', 
  'mother.name'
];

// Required fields by step
export const REQUIRED_FIELDS_BY_STEP: Record<number, string[]> = {
  1: ['admissionNo', 'fullName', 'admissionDate', 'dateOfBirth', 'gender'],
  2: ['className'],
  3: ['mobileNumber'],
  4: ['address.city', 'address.state'],
  5: ['father.name', 'mother.name'],
  6: [], // Document uploads - no required text fields
  7: [] // Other details - no required fields
};

// Define fields to validate by step
export const FIELDS_TO_VALIDATE_BY_STEP: Record<number, string[]> = {
  1: ['branchName', 'admissionNo', 'penNo', 'firstName', 'middleName', 'lastName', 
      'admissionDate', 'studentId', 'dateOfBirth', 'age', 'religion', 'gender', 
      'bloodGroup', 'caste'],
  2: ['className', 'section', 'stream', 'semester', 'rollNumber', 'admitSession.class', 
      'admitSession.section', 'admitSession.rollNo', 'currentSession.class',
      'academic.registrationNo', 'previousSchool'],
  3: ['mobileNumber', 'email', 'emergencyContact'],
  4: ['address.street', 'address.houseNo', 'address.city', 'address.state', 'address.pinCode',
      'address.permanentStreet', 'address.permanentHouseNo', 'address.permanentCity', 
      'address.permanentState', 'address.permanentPinCode',
      'transport.mode', 'transport.area', 'transport.stand', 'transport.route', 
      'transport.driver', 'transport.pickupLocation', 'transport.dropLocation'],
  5: ['father.name', 'father.qualification', 'father.occupation', 'father.email', 
      'father.contactNumber', 'father.aadhaarNo', 'father.annualIncome',
      'mother.name', 'mother.qualification', 'mother.occupation', 'mother.email', 
      'mother.contactNumber', 'mother.aadhaarNo', 'mother.annualIncome',
      'guardian.name', 'guardian.address', 'guardian.contactNumber'],
  6: [], // Document upload step - no text validation
  7: ['aadhaarNumber', 'nationality', 'other.accountNo', 'other.bank', 'other.ifscCode',
      'other.medium', 'other.motherTongue', 'lastEducation.school', 'lastEducation.percentage']
};

/**
 * Check if a field is required
 * @param name Field name
 * @returns Boolean indicating if field is required
 */
export const isRequiredField = (name: string): boolean => {
  return REQUIRED_FIELDS.includes(name);
};

/**
 * Get the nested value from an object using a dot notation path
 * @param obj The object to get value from
 * @param path The dot notation path
 * @returns The value at the path
 */
export const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split('.');
  return keys.reduce((o, key) => (o ? o[key] : undefined), obj);
};

/**
 * Set a nested value in an object using a dot notation path
 * @param obj The object to set value in
 * @param path The dot notation path
 * @param value The value to set
 * @returns The updated object
 */
export const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return obj; // If no key, return original object
  
  const objCopy = { ...obj };
  let current = objCopy;
  
  // Navigate to the parent object
  for (const key of keys) {
    if (!current[key]) current[key] = {};
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  // Set the value
  current[lastKey] = value;
  return objCopy;
};

/**
 * Validate a single field
 * @param name Field name
 * @param value Field value
 * @returns Error message or null if valid
 */
export const validateField = (name: string, value: string): string | null => {
  // Skip validation for empty non-required fields
  if (!value && !isRequiredField(name)) return null;
  
  // Check required fields
  if (isRequiredField(name) && !value) {
    return `This field is required`;
  }
  
  // Special validation for dateOfBirth
  if (name === 'dateOfBirth') {
    if (!value) {
      return 'Date of Birth is required';
    }
    
    try {
      const date = new Date(value);
      const today = new Date();
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }
      
      // Check if date is not in the future
      if (date > today) {
        return 'Date of Birth cannot be in the future';
      }
      
      // Check if the student is not too old (e.g., 100 years)
      const maxAge = 100;
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - maxAge);
      
      if (date < minDate) {
        return `Date of Birth cannot be more than ${maxAge} years ago`;
      }
    } catch (e) {
      return 'Please enter a valid date';
    }
  }
  
  // Special validation for other date fields
  if (name === 'admissionDate' || name.includes('tcDate')) {
    if (value && isNaN(new Date(value).getTime())) {
      return 'Please enter a valid date';
    }
  }
  
  // Pattern validations based on field type
  if (name === 'email' || name === 'father.email' || name === 'mother.email') {
    if (value && !VALIDATION_PATTERNS.EMAIL.test(value)) {
      return 'Please enter a valid email address';
    }
  } else if (name === 'mobileNumber' || name === 'emergencyContact' || 
             name === 'father.contactNumber' || name === 'mother.contactNumber' || 
             name === 'guardian.contactNumber') {
    if (value && !VALIDATION_PATTERNS.PHONE.test(value)) {
      return 'Please enter a valid phone number';
    }
  } else if (name === 'aadhaarNumber' || name === 'father.aadhaarNo' || name === 'mother.aadhaarNo') {
    if (value && !VALIDATION_PATTERNS.AADHAAR.test(value)) {
      return 'Please enter a valid 12-digit Aadhaar number';
    }
  } else if (name === 'address.pinCode' || name === 'address.permanentPinCode') {
    if (value && !VALIDATION_PATTERNS.PINCODE.test(value)) {
      return 'Please enter a valid 6-digit PIN code';
    }
  } else if (name === 'other.accountNo') {
    if (value && !VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(value)) {
      return 'Please enter a valid account number';
    }
  } else if (name === 'other.ifscCode') {
    if (value && !VALIDATION_PATTERNS.IFSC.test(value)) {
      return 'Please enter a valid IFSC code';
    }
  }
  
  return null;
};

/**
 * Validates all fields in a specific step
 * @param formData Form data to validate
 * @param stepNumber Step number to validate
 * @returns Object with validation errors
 */
export const validateStep = (formData: StudentFormData, stepNumber: number): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldsToValidate = FIELDS_TO_VALIDATE_BY_STEP[stepNumber] || [];

  // First check required fields
  const requiredFields = REQUIRED_FIELDS_BY_STEP[stepNumber] || [];
  
  requiredFields.forEach(field => {
    let value: any;
    
    if (field.includes('.')) {
      value = getNestedValue(formData, field);
    } else {
      value = formData[field as keyof StudentFormData];
    }
    
    if (value === undefined || value === '' || value === null) {
      errors[field] = 'This field is required';
    }
  });

  // Then validate format for all fields in the step
  fieldsToValidate.forEach(field => {
    let value: string;
    
    if (field.includes('.')) {
      value = getNestedValue(formData, field) || '';
    } else {
      value = (formData[field as keyof StudentFormData] as string) || '';
    }
    
    // Skip if already marked as required and empty
    if (!errors[field]) {
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Checks if a step has validation errors
 * @param errors Validation errors object
 * @returns Boolean indicating if there are errors
 */
export const hasValidationErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Validates the entire form
 * @param formData Form data to validate
 * @returns Object with all validation errors
 */
export const validateForm = (formData: StudentFormData): Record<string, string> => {
  let allErrors: Record<string, string> = {};
  
  // Validate each step
  for (let step = 1; step <= 7; step++) {
    const stepErrors = validateStep(formData, step);
    allErrors = { ...allErrors, ...stepErrors };
  }
  
  return allErrors;
}; 