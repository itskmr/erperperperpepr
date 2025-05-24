import React, { useEffect } from 'react';
import { useStudentRegistration } from '../components/StudentForm/useStudentRegistration';
import StudentFormSections from '../components/StudentForm/StudentFormSections';
import StudentFormProgress from '../components/StudentForm/StudentFormProgress';
import { useNavigate } from 'react-router-dom';

/**
 * Student Registration Form Component
 * This is the main container that brings together all form components
 */
const StudentRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    formData,
    isSubmitting,
    error,
    success,
    steps,
    validationErrors,
    handleChange,
    handleFileChange,
    handleSubmit,
    nextStep,
    prevStep
  } = useStudentRegistration();

  // Show modal when registration is successful
  const [showModal, setShowModal] = React.useState(false);
  
  useEffect(() => {
    if (success) {
      setShowModal(true);
    }
  }, [success]);

  const handlePrint = () => {
    // Create a print-friendly version that shows all form sections
    const currentStepBackup = currentStep;
    
    // Create a temporary div to hold all form sections for printing
    const printContainer = document.createElement('div');
    printContainer.className = 'print-only-container';
    printContainer.style.display = 'none';
    document.body.appendChild(printContainer);
    
    // Clone the form and show all sections
    const formClone = document.querySelector('.bg-white.rounded-lg.p-6.border')?.cloneNode(true) as HTMLElement;
    if (formClone) {
      // Add a header to the print view
      const header = document.createElement('div');
      header.innerHTML = `
        <div class="flex justify-between items-center mb-8 border-b pb-6 print-header">
          <div class="flex items-center">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl mr-4">
              <span>S</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">School ERPS</h1>
              <p class="text-gray-500">Student Management System</p>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-center text-blue-600">Student Registration Form</h2>
        </div>
        <div class="my-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p class="font-bold">Student Details: ${formData.fullName} - Admission No: ${formData.admissionNo}</p>
        </div>
      `;
      printContainer.appendChild(header);
      
      // Add all form sections to the print container
      steps.forEach((step, index) => {
        const stepHeader = document.createElement('div');
        stepHeader.className = 'print-step-header';
        stepHeader.innerHTML = `
          <h3 class="text-xl font-bold mt-8 mb-4 text-blue-600 border-b pb-2">
            ${step.icon} ${step.title}
          </h3>
        `;
        printContainer.appendChild(stepHeader);
        
        // Create a temporary form section for this step
        const tempFormSection = document.createElement('div');
        document.body.appendChild(tempFormSection);
        
        // Render the form section for this step
        const tempRoot = document.createElement('div');
        tempFormSection.appendChild(tempRoot);
        
        // Clone the current form and append to print container
        const sectionClone = document.createElement('div');
        sectionClone.className = 'print-form-section';
        
        // Use the existing StudentFormSections component to render each section
        const formSectionElement = document.querySelector('.space-y-6');
        if (formSectionElement) {
          sectionClone.appendChild(formSectionElement.cloneNode(true));
        }
        
        printContainer.appendChild(sectionClone);
        
        // Clean up temporary elements
        document.body.removeChild(tempFormSection);
      });
      
      // Add footer
      const footer = document.createElement('div');
      footer.className = 'mt-12 border-t pt-6 print-footer';
      footer.innerHTML = `
        <div class="flex justify-between">
          <div>
            <p class="text-sm text-gray-500">Date Generated: ${new Date().toLocaleDateString()}</p>
            <p class="text-sm text-gray-500">Form ID: SERPS-${formData.admissionNo}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-700 font-semibold">School ERPS System</p>
            <p class="text-sm text-gray-500">This is a computer generated form and requires no signature</p>
          </div>
        </div>
      `;
      printContainer.appendChild(footer);
    }
    
    // Add print-specific CSS
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-only-container, .print-only-container * {
          visibility: visible;
        }
        .print-only-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          display: block !important;
        }
        .print-form-section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .print-step-header {
          margin-top: 20px;
          page-break-after: avoid;
        }
        .print-footer {
          margin-top: 30px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Show the print dialog
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(printContainer);
      document.head.removeChild(style);
    }, 1000);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg print:shadow-none print:max-w-full">
      {/* Header with School Logo */}
      <div className="flex justify-between items-center mb-8 border-b pb-6 print:flex-col print:items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl mr-4 print:block">
            <span>S</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">NPS ERPS</h1>
            <p className="text-gray-500">Student Admission Management System</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-600 print:mt-4">Student Admission Form</h2>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="my-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center print:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Student registered successfully!</span>
        </div>
      )}

      {/* Progress Bar - Moved up above the form */}
      <div className="print:hidden mb-8">
        <StudentFormProgress 
          currentStep={currentStep}
          steps={steps}
          isSubmitting={isSubmitting}
          isLastStep={currentStep === steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={(e) => {
            console.log("Submitting form from progress component");
            // Submit the form programmatically
            const form = document.getElementById('studentRegistrationForm') as HTMLFormElement;
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
          success={success}
        />
      </div>

      {/* Form with Sections */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6 print:shadow-none print:border-none">
        <form 
          id="studentRegistrationForm"
          onSubmit={(e) => {
            console.log("Form submission triggered");
            handleSubmit(e);
          }} 
          className="space-y-6"
        >
          <StudentFormSections
            currentStep={currentStep}
            formData={formData}
            validationErrors={validationErrors}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
        </form>
      </div>
      
      {/* Print-specific form footer */}
      <div className="hidden print:block mt-12 border-t pt-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Date Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Form ID: SERPS-{formData.admissionNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 font-semibold">School ERPS System</p>
            <p className="text-sm text-gray-500">This is a computer generated form and requires no signature</p>
          </div>
        </div>
      </div>
      
      {/* Success Modal/Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Registration Successful!</h3>
              <p className="mt-2 text-gray-600">
                Student {formData.fullName} has been successfully registered with Admission Number: {formData.admissionNo}
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-md shadow hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Form
                </button>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Dashboard
                </button>
              </div>
              
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Print button for bottom of form (only visible after successful submission) */}
      {success && (
        <div className="mt-6 flex justify-center print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Student Registration Form
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentRegistrationForm;