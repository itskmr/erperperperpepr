import { StudentFormData } from './StudentFormTypes';

// Validation patterns
const VALIDATION_PATTERNS = {
  TEXT_ONLY: /^[a-zA-Z\s]*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]*$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[0-9]{10}$/,
  PINCODE: /^[0-9]{6}$/,
  AADHAAR: /^[0-9]{12}$/,
  APAAR_ID: /^[0-9]{12}$/,
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
  INVALID_APAAR_ID: 'Please enter a valid 12-digit APAAR ID',
  INVALID_PERCENTAGE: 'Please enter a valid percentage (0-100)',
  INVALID_ROLL_NUMBER: 'Please enter a valid roll number',
  INVALID_ADMISSION_NO: 'Please enter a valid admission number',
  INVALID_IFSC: 'Please enter a valid IFSC code',
  INVALID_BANK_ACCOUNT: 'Please enter a valid bank account number',
  INVALID_TEXT: 'Please enter only alphabetic characters',
  TEXT_ONLY: 'Only alphabetic characters are allowed',
  ALPHANUMERIC: 'Only alphanumeric characters are allowed'
};

interface RequiredFields {
  [key: number]: string[];
}

// Updated required fields - only student name, class, father name, and admission number
export const REQUIRED_FIELDS: RequiredFields = {
  1: [
    'fullName',        // Student name - required
    'admissionNo',     // Admission number - required
    'admitSession.class', // Class - required
    'father.name'      // Father name - required
  ]
};

// Required fields by step - updated to match new requirements
export const REQUIRED_FIELDS_BY_STEP: Record<number, string[]> = {
  1: ['admissionNo', 'fullName'], // Basic info step - admission number and student name
  2: ['admitSession.class'], // Academic step - class is required
  3: [], // Contact - all optional now
  4: [], // Address - all optional now
  5: ['father.name'], // Parent info - only father name required
  6: [], // Document uploads - no required text fields
  7: [] // Other details - no required fields
};

// Fields to validate for each step - only required fields and format validation for optional fields
const FIELDS_TO_VALIDATE_BY_STEP: Record<number, string[]> = {
  1: ['fullName', 'admissionNo'], // Only student name and admission number required in step 1
  2: ['admitSession.class'], // Only class required in step 2
  3: [], // No required fields in contact step, only format validation when provided
  4: [], // No required fields in address step
  5: ['father.name'], // Only father name required in step 5
  6: [], // No required fields in education step
  7: [] // No required fields in other details step
};

/**
 * Validates a single field
 * @param fieldName Name of the field to validate
 * @param value Value to validate
 * @returns Error message if validation fails, empty string if valid
 */
export const validateField = (fieldName: string, value: string): string => {
  // Required fields validation
  const requiredFields = ['fullName', 'admissionNo', 'admitSession.class', 'father.name'];
  
  if (requiredFields.includes(fieldName)) {
    if (!value || value.trim() === '') {
      return VALIDATION_MESSAGES.REQUIRED;
    }
  }
  
  // If field is empty and not required, skip format validation
  if (!value || value.trim() === '') {
    return '';
  }
  
  // Format validation for non-empty fields
  switch (fieldName) {
    case 'email':
    case 'father.email':
    case 'mother.email':
    case 'guardian.email':
      return !VALIDATION_PATTERNS.EMAIL.test(value) ? VALIDATION_MESSAGES.INVALID_EMAIL : '';
    
    case 'mobileNumber':
    case 'father.contactNumber':
    case 'mother.contactNumber':
    case 'guardian.contactNumber':
    case 'emergencyContact':
      return !VALIDATION_PATTERNS.PHONE.test(value) ? VALIDATION_MESSAGES.INVALID_PHONE : '';
    
    case 'aadhaarNumber':
    case 'father.aadhaarNo':
    case 'mother.aadhaarNo':
    case 'guardian.aadhaarNo':
      return !VALIDATION_PATTERNS.AADHAAR.test(value) ? VALIDATION_MESSAGES.INVALID_AADHAAR : '';
    
    case 'apaarId':
      return !VALIDATION_PATTERNS.APAAR_ID.test(value) ? VALIDATION_MESSAGES.INVALID_APAAR_ID : '';
    
    case 'address.pinCode':
    case 'address.permanentPinCode':
      return !VALIDATION_PATTERNS.PINCODE.test(value) ? VALIDATION_MESSAGES.INVALID_PINCODE : '';
    
    case 'other.ifscCode':
      return !VALIDATION_PATTERNS.IFSC_CODE.test(value) ? VALIDATION_MESSAGES.INVALID_IFSC : '';
    
    case 'other.accountNo':
      return !VALIDATION_PATTERNS.BANK_ACCOUNT.test(value) ? VALIDATION_MESSAGES.INVALID_BANK_ACCOUNT : '';
    
    case 'lastEducation.percentage':
      return !VALIDATION_PATTERNS.PERCENTAGE.test(value) ? VALIDATION_MESSAGES.INVALID_PERCENTAGE : '';
    
    case 'fullName':
    case 'father.name':
    case 'mother.name':
    case 'guardian.name':
      return !VALIDATION_PATTERNS.TEXT_ONLY.test(value) ? VALIDATION_MESSAGES.INVALID_TEXT : '';
    
    case 'admissionNo':
    case 'admitSession.rollNo':
    case 'currentSession.rollNo':
      return !VALIDATION_PATTERNS.ADMISSION_NO.test(value) ? VALIDATION_MESSAGES.INVALID_ADMISSION_NO : '';
    
    default:
      return '';
  }
};

// Validate all fields in the current step
export const validateStep = (step: number, formData: StudentFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldsToValidate = FIELDS_TO_VALIDATE_BY_STEP[step] || [];
  
  fieldsToValidate.forEach(field => {
    let value: string;
    
    if (field.includes('.')) {
      const keys = field.split('.');
      let current: unknown = formData;
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          current = undefined;
          break;
        }
      }
      value = String(current || '');
    } else {
      value = String(formData[field as keyof StudentFormData] || '');
    }
    
    const error = validateField(field, value);
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
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const keys = path.split('.');
  return keys.reduce((o: unknown, key: string) => (o && typeof o === 'object' && key in o ? (o as Record<string, unknown>)[key] : undefined), obj);
};

/**
 * Set a nested value in an object using a dot notation path
 * @param obj The object to set value in
 * @param path The dot notation path
 * @param value The value to set
 * @returns The updated object
 */
export const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return obj; // If no key, return original object
  
  const objCopy = { ...obj };
  let current: Record<string, unknown> = objCopy;
  
  // Navigate to the parent object
  for (const key of keys) {
    if (!current[key]) current[key] = {};
    current[key] = { ...current[key] as Record<string, unknown> };
    current = current[key] as Record<string, unknown>;
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
  const errors: Record<string, string> = {};

  // Required field validation - only these 4 fields are required
  if (!formData.fullName) {
    errors.fullName = 'Student name is required';
  }

  if (!formData.admissionNo) {
    errors.admissionNo = 'Admission number is required';
  }

  // Check nested class field
  if (!formData.admitSession?.class) {
    errors['admitSession.class'] = 'Class is required';
  }

  // Check nested father name field
  if (!formData.father?.name) {
    errors['father.name'] = 'Father name is required';
  }

  // Optional field format validation - only validate if provided
  if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
    errors.email = 'Invalid email address';
  }

  if (formData.father?.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.father.email)) {
    errors['father.email'] = 'Invalid email address';
  }

  if (formData.mother?.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.mother.email)) {
    errors['mother.email'] = 'Invalid email address';
  }

  if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
    errors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
  }

  if (formData.apaarId && !/^\d{12}$/.test(formData.apaarId)) {
    errors.apaarId = 'APAAR ID must be exactly 12 digits';
  }

  if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
    errors.mobileNumber = 'Mobile number must be exactly 10 digits';
  }

  if (formData.father?.contactNumber && !/^\d{10}$/.test(formData.father.contactNumber)) {
    errors['father.contactNumber'] = 'Phone number must be exactly 10 digits';
  }

  if (formData.mother?.contactNumber && !/^\d{10}$/.test(formData.mother.contactNumber)) {
    errors['mother.contactNumber'] = 'Phone number must be exactly 10 digits';
  }

  if (formData.father?.aadhaarNo && !/^\d{12}$/.test(formData.father.aadhaarNo)) {
    errors['father.aadhaarNo'] = 'Aadhaar number must be exactly 12 digits';
  }

  if (formData.mother?.aadhaarNo && !/^\d{12}$/.test(formData.mother.aadhaarNo)) {
    errors['mother.aadhaarNo'] = 'Aadhaar number must be exactly 12 digits';
  }

  // Address Validation - optional
  if (formData.address?.pinCode && !/^\d{6}$/.test(formData.address.pinCode)) {
    errors['address.pinCode'] = 'Pin code must be exactly 6 digits';
  }

  if (formData.address?.permanentPinCode && !/^\d{6}$/.test(formData.address.permanentPinCode)) {
    errors['address.permanentPinCode'] = 'Pin code must be exactly 6 digits';
  }

  // Bank details validation - optional
  if (formData.other?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.other.ifscCode)) {
    errors['other.ifscCode'] = 'Invalid IFSC code format';
  }

  if (formData.other?.accountNo && !/^[0-9]{9,18}$/.test(formData.other.accountNo)) {
    errors['other.accountNo'] = 'Invalid account number format (9-18 digits)';
  }

  return errors;
}; 