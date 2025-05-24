import React from 'react';
import { Step } from './StudentFormTypes';

interface StudentFormProgressProps {
  currentStep: number;
  steps: Step[];
  isSubmitting: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  success?: boolean;  // Added for print button visibility
}

/**
 * Progress bar component for the student registration form
 */
export const StudentFormProgress: React.FC<StudentFormProgressProps> = ({
  currentStep,
  steps,
  isSubmitting,
  isLastStep,
  onNext,
  onPrev,
  onSubmit,
  success = false
}) => {
  // Function to handle printing the form
  const handlePrintForm = () => {
    window.print();
  };

  // Function to trigger form submission
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Create a synthetic form event to pass to onSubmit
    const formEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    
    // Add extra logging to help debug submission issues
    console.log('Submit button clicked in progress component');
    
    // Call the onSubmit handler
    onSubmit(formEvent);
  };

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center z-10 transition-all duration-300 ${
                currentStep === step.id ? 'transform scale-110' : ''
              } ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-full border-2 mb-2 shadow-md transition-all 
                ${currentStep > step.id 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : currentStep === step.id 
                    ? 'border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100' 
                    : 'border-gray-300 bg-white text-gray-500'}`}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <span className="text-xs font-semibold">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Buttons - Now with improved styling and clarity */}
      <div className="mt-8 flex justify-between items-center border-t pt-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </span>
          </button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}
        
        <div className="flex gap-4">
          {/* Print button shown only after successful submission */}
          {success && (
            <button
              type="button"
              onClick={handlePrintForm}
              className="px-6 py-3 border border-teal-500 rounded-lg shadow-sm text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Form
              </span>
            </button>
          )}
          
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="flex items-center">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span className="flex items-center">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Complete Registration
                  </>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentFormProgress; 