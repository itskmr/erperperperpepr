/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Formats an ISO date string to "yyyy-MM-dd" format for HTML date inputs
 * @param isoDateString - ISO date string from backend (e.g., "2020-01-01T00:00:00.000Z")
 * @returns Formatted date string "yyyy-MM-dd" or empty string if invalid
 */
export const formatDateForInput = (isoDateString: string | null | undefined): string => {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    // Format to yyyy-MM-dd for HTML date inputs
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Formats an ISO date string for display purposes
 * @param isoDateString - ISO date string from backend
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (isoDateString: string | null | undefined, locale: string = 'en-US'): string => {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Formats current date to "yyyy-MM-dd" format
 * @returns Current date in "yyyy-MM-dd" format
 */
export const getCurrentDateForInput = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Validates if a date string is in valid format and not in the future (for certain validations)
 * @param dateString - Date string to validate
 * @param allowFuture - Whether future dates are allowed (default: true)
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateDate = (dateString: string, allowFuture: boolean = true): { isValid: boolean; error?: string } => {
  if (!dateString) return { isValid: true }; // Empty dates are often optional
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (!allowFuture && date > new Date()) {
      return { isValid: false, error: 'Date cannot be in the future' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' };
  }
};

/**
 * Converts a date input value back to ISO string for backend
 * @param dateInputValue - Date value from HTML date input (yyyy-MM-dd)
 * @returns ISO string or null if empty
 */
export const convertDateInputToISO = (dateInputValue: string): string | null => {
  if (!dateInputValue) return null;
  try {
    const date = new Date(dateInputValue);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date input to ISO:', error);
    return null;
  }
};

/**
 * Checks if a date is expired (past current date)
 * @param isoDateString - ISO date string to check
 * @returns Boolean indicating if date is expired
 */
export const isDateExpired = (isoDateString: string | null | undefined): boolean => {
  if (!isoDateString) return false;
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return false;
    return date < new Date();
  } catch (error) {
    return false;
  }
}; 