import { NavigateFunction } from 'react-router-dom';

/**
 * Handles user logout by clearing authentication data and redirecting to login
 * @param navigate 
 */
export const handleSignOut = (navigate: NavigateFunction) => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
  localStorage.removeItem('loginTimestamp');
  
  sessionStorage.clear();
  
  document.cookie = 'authCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  navigate('/login');
};