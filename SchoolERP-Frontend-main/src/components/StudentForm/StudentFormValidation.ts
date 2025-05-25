import { StudentFormData } from './StudentFormTypes';

// Validation patterns
const VALIDATION_PATTERNS = {
  TEXT_ONLY: /^[a-zA-Z\s]*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]*$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[0-9]{10}$/,
  PINCODE: /^[0-9]{6}$/,
  AADHAAR: /^[0-9]{12}$/,
  PERCENTAGE: /^[0-9]{1,2}(\.[0-9]{1,2})?$/,
  ROLL_NUMBER: /^[A-Za-z0-9-]+$/,
  ADMISSION_NO: /^[A-Za-z0-9-]+$/,
  IFSC_CODE: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  BANK_ACCOUNT: /^[0-9]{9,18}$/
};

// Validation messages
const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_PINCODE: 'Please enter a valid 6-digit PIN code',
  INVALID_AADHAAR: 'Please enter a valid 12-digit Aadhaar number',
  INVALID_PERCENTAGE: 'Please enter a valid percentage (0-100)',
  INVALID_ROLL_NUMBER: 'Please enter a valid roll number',
  INVALID_ADMISSION_NO: 'Please enter a valid admission number',
  INVALID_IFSC: 'Please enter a valid IFSC code',
  INVALID_BANK_ACCOUNT: 'Please enter a valid bank account number',
  TEXT_ONLY: 'Please enter text only (no numbers or special characters)',
  ALPHANUMERIC: 'Please enter alphanumeric characters only'
};

interface RequiredFields {
  [key: number]: string[];
}

export const REQUIRED_FIELDS: RequiredFields = {
  // Step 1: Personal Information
  1: [
    'fullName',
    'dateOfBirth',
    'gender',
    'bloodGroup',
    'religion',
    'nationality',
    'category',
    'address.city',
    'address.state',
    'address.country',
    'address.pincode',
    'address.addressLine1'
  ],
  // Step 2: Academic Information
  2: [
    'admitSession.group',
    'admitSession.class',
    'admitSession.section',
    'admitSession.rollNo',
    'admitSession.semester',
    'admitSession.feeGroup',
    'admitSession.house',
    'lastEducation.school',
    'lastEducation.address',
    'lastEducation.tcDate',
    'lastEducation.prevClass',
    'lastEducation.percentage',
    'lastEducation.attendance',
    'lastEducation.extraActivity'
  ]
};

// Required fields by step
export const REQUIRED_FIELDS_BY_STEP: Record<number, string[]> = {
  1: ['admissionNo', 'fullName', 'admissionDate', 'dateOfBirth', 'gender', 'nationality'],
  2: [], // Remove className requirement
  3: ['mobileNumber', 'email'],
  4: ['address.city', 'address.state'],
  5: ['father.name', 'mother.name'],
  6: [], // Document uploads - no required text fields
  7: [] // Other details - no required fields
};

// Define fields to validate by step
export const FIELDS_TO_VALIDATE_BY_STEP: RequiredFields = {
  1: ['branchName', 'admissionNo', 'penNo', 'fullName', 
      'admissionDate', 'studentId', 'dateOfBirth', 'age', 'religion', 'gender', 
      'bloodGroup', 'caste', 'category', 'nationality', 'aadhaarNumber'],
  2: ['admitSession.class', 
      'admitSession.section', 
      'admitSession.rollNo', 
      'academic.registrationNo', 
      'previousSchool'],
  3: ['mobileNumber', 'email', 'emergencyContact', 'father.contactNumber', 'father.email',
      'mother.contactNumber', 'mother.email'],
  4: ['address.street', 'address.houseNo', 'address.city', 'address.state', 'address.pinCode',
      'address.permanentStreet', 'address.permanentHouseNo', 'address.permanentCity', 
      'address.permanentState', 'address.permanentPinCode',
      'transport.mode', 'transport.area', 'transport.stand', 'transport.route', 
      'transport.driver', 'transport.pickupLocation', 'transport.dropLocation'],
  5: ['father.name', 'father.qualification', 'father.occupation', 'father.email', 
      'father.contactNumber', 'father.aadhaarNo', 'father.annualIncome',
      'mother.name', 'mother.qualification', 'mother.occupation', 'mother.email', 
      'mother.contactNumber', 'mother.aadhaarNo', 'mother.annualIncome',
      'guardian.name', 'guardian.address', 'guardian.contactNumber', 'guardian.email',
      'guardian.aadhaarNo', 'guardian.occupation', 'guardian.annualIncome'],
  6: [], // Document upload step - no text validation
  7: ['aadhaarNumber', 'nationality', 'other.accountNo', 'other.bank', 'other.ifscCode',
      'other.medium', 'other.motherTongue', 'lastEducation.school', 'lastEducation.percentage']
};

// Validate a single field
export const validateField = (name: string, value: string): string | null => {
  // Skip validation for empty optional fields
  if (value === '' && !REQUIRED_FIELDS[1].includes(name)) {
    return null;
  }

  // Required field validation
  if (REQUIRED_FIELDS[1].includes(name) && !value) {
    return VALIDATION_MESSAGES.REQUIRED;
  }

  // Field-specific validation
  switch (name) {
    case 'email':
    case 'father.email':
    case 'mother.email':
    case 'guardian.email':
      return VALIDATION_PATTERNS.EMAIL.test(value) ? null : VALIDATION_MESSAGES.INVALID_EMAIL;
    
    case 'mobileNumber':
    case 'father.contactNumber':
    case 'mother.contactNumber':
    case 'guardian.contactNumber':
    case 'emergencyContact':
      return VALIDATION_PATTERNS.PHONE.test(value) ? null : VALIDATION_MESSAGES.INVALID_PHONE;
    
    case 'address.pinCode':
    case 'address.permanentPinCode':
      return VALIDATION_PATTERNS.PINCODE.test(value) ? null : VALIDATION_MESSAGES.INVALID_PINCODE;
    
    case 'address.city':
    case 'address.permanentCity':
      return value.trim().length > 0 ? null : VALIDATION_MESSAGES.REQUIRED;
    
    case 'address.state':
    case 'address.permanentState':
      return value.trim().length > 0 ? null : VALIDATION_MESSAGES.REQUIRED;
    
    case 'aadhaarNumber':
    case 'father.aadhaarNo':
    case 'mother.aadhaarNo':
    case 'guardian.aadhaarNo':
      return VALIDATION_PATTERNS.AADHAAR.test(value) ? null : VALIDATION_MESSAGES.INVALID_AADHAAR;
    
    case 'lastEducation.percentage':
      return VALIDATION_PATTERNS.PERCENTAGE.test(value) ? null : VALIDATION_MESSAGES.INVALID_PERCENTAGE;
    
    case 'rollNumber':
    case 'admitSession.rollNo':
      return VALIDATION_PATTERNS.ROLL_NUMBER.test(value) ? null : VALIDATION_MESSAGES.INVALID_ROLL_NUMBER;
    
    case 'admissionNo':
      return VALIDATION_PATTERNS.ADMISSION_NO.test(value) ? null : VALIDATION_MESSAGES.INVALID_ADMISSION_NO;
    
    case 'other.ifscCode':
      return VALIDATION_PATTERNS.IFSC_CODE.test(value) ? null : VALIDATION_MESSAGES.INVALID_IFSC;
    
    case 'other.accountNo':
      return VALIDATION_PATTERNS.BANK_ACCOUNT.test(value) ? null : VALIDATION_MESSAGES.INVALID_BANK_ACCOUNT;
    
    default:
      return null;
  }
};

// Validate all fields in the current step
export const validateStep = (step: number, formData: StudentFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldsToValidate = FIELDS_TO_VALIDATE_BY_STEP[step] || [];
  
  fieldsToValidate.forEach(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], formData as any)
      : formData[field as keyof StudentFormData];
    
    const error = validateField(field, String(value || ''));
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

/**
 * Check if a field is required
 * @param name Field name
 * @returns Boolean indicating if field is required
 */
export const isRequiredField = (name: string): boolean => {
  return REQUIRED_FIELDS[1].includes(name);
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
    const stepErrors = validateStep(step, formData);
    allErrors = { ...allErrors, ...stepErrors };
  }
  
  return allErrors;
}; 