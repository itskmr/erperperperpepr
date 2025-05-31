import React from 'react';
import { StudentFormData, Documents } from './StudentFormTypes';

interface InputProps {
  type?: 'text' | 'tel' | 'email' | 'password' | 'number' | 'date';
  pattern?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
}

interface StudentFormSectionsProps {
  currentStep: number;
  formData: StudentFormData;
  validationErrors: Record<string, string>;
  transportRoutes: Array<{ id: string; name: string; fromLocation: string; toLocation: string; }>;
  drivers: Array<{ id: string; name: string; contactNumber: string; }>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof Documents) => void;
}

interface FormSectionProps {
  formData: StudentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Component that renders the appropriate form section based on current step
 */
const StudentFormSections: React.FC<StudentFormSectionsProps> = ({
  currentStep,
  formData,
  validationErrors,
  transportRoutes,
  drivers,
  handleChange,
  handleFileChange
}) => {
  
  // Helper function to render input with validation and border
  const renderInput = (
    label: string, 
    name: string, 
    type: InputProps['type'] = 'text', 
    required: boolean = false,
    placeholder: string = '',
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void,
    inputProps?: InputProps,
    readOnly: boolean = false
  ) => {
    const error = name.includes('.') 
      ? validationErrors[name] 
      : validationErrors[name as keyof typeof validationErrors];
    
    // Only these 4 fields are actually required
    const isActuallyRequired = ['fullName', 'admissionNo', 'admitSession.class', 'father.name'].includes(name);
    
    // Handle keypress for numeric fields
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (inputProps?.inputMode === 'numeric') {
        // Allow only numbers and control keys
        const isNumber = /[0-9]/.test(e.key);
        const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
        if (!isNumber && !isControl) {
          e.preventDefault();
        }
      }
    };
    
    // Get maxLength based on field type
    const getMaxLength = (fieldName: string): number | undefined => {
      if (fieldName === 'aadhaarNumber' || fieldName.includes('aadhaarNo')) return 12;
      if (fieldName === 'apaarId') return 12;
      if (fieldName === 'mobileNumber' || fieldName.includes('contactNumber')) return 10;
      if (fieldName.includes('pinCode')) return 6;
      return undefined;
    };
    
    // Safely get the value from nested path
    const getValue = (name: string, data: StudentFormData): string => {
      if (!name.includes('.')) {
        const val = data[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        try {
          const parts = name.split('.');
          let value: unknown = { ...data };
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object' && value !== null && part in value) {
              value = (value as Record<string, unknown>)[part];
            } else {
              return '';
            }
          }
          return value !== null && value !== undefined ? String(value) : '';
        } catch (e) {
          console.error(`Error accessing ${name}:`, e);
          return '';
        }
      }
    };
    
    // Special handling for date inputs
    const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === 'date' && 'showPicker' in HTMLInputElement.prototype) {
        // Use modern browsers' showPicker method if available
        (e.target as HTMLInputElement).showPicker?.();
      }
    };
    
    return (
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${error ? 'text-red-600' : 'text-gray-700'}`}>
          {label}
          {isActuallyRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={getValue(name, formData)}
          onChange={readOnly ? undefined : handleChange}
          onFocus={onFocus || (type === 'date' ? handleDateFocus : undefined)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          pattern={inputProps?.pattern}
          inputMode={inputProps?.inputMode}
          className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all ${
            readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
          } ${
            error ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
          }`}
          required={required}
          maxLength={getMaxLength(name)}
          readOnly={readOnly}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to render select dropdown
  const renderSelect = (
    label: string, 
    name: string, 
    options: string[] | { value: string; label: string }[], 
    required: boolean = false,
    placeholder: string = 'Select...'
  ) => {
    const error = name.includes('.') 
      ? validationErrors[name] 
      : validationErrors[name as keyof typeof validationErrors];
    
    const getValue = (name: string, data: StudentFormData): string => {
      if (!name.includes('.')) {
        const val = data[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        try {
          const parts = name.split('.');
          let value: unknown = { ...data };
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object' && value !== null && part in value) {
              value = (value as Record<string, unknown>)[part];
            } else {
              return '';
            }
          }
          return value !== null && value !== undefined ? String(value) : '';
        } catch (e) {
          console.error(`Error accessing ${name}:`, e);
          return '';
        }
      }
    };
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={getValue(name, formData)}
          onChange={(e) => handleChange(e)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => {
            if (typeof option === 'string') {
              return (
                <option key={option} value={option}>
                  {option}
                </option>
              );
            } else {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            }
          })}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to render textarea with validation
  const renderTextarea = (
    label: string, 
    name: string, 
    required: boolean = false,
    rows: number = 3
  ) => {
    const error = name.includes('.') 
      ? validationErrors[name] 
      : validationErrors[name as keyof typeof validationErrors];
    
    // Reuse the same getValue function logic to maintain consistency
    const getValue = (name: string, data: StudentFormData): string => {
      if (!name.includes('.')) {
        // For simple properties
        const val = data[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        // For nested properties
        try {
          const parts = name.split('.');
          let value: any = { ...data };
          
          // Navigate the path
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            value = value[part];
          }
          
          // Return empty string if value is null or undefined
          return value !== null && value !== undefined ? String(value) : '';
        } catch (e) {
          console.error(`Error accessing ${name}:`, e);
          return '';
        }
      }
    };
    
    return (
      <label className="block mb-5">
        <span className="text-gray-700 font-medium">{label} {required && <span className="text-red-500">*</span>}</span>
        <textarea
          name={name}
          value={getValue(name, formData)}
          onChange={handleChange}
          rows={rows}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all bg-gray-50 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          required={required}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </label>
    );
  };

  // Helper function to render file input with validation
  const renderFileInput = (
    label: string, 
    name: keyof Documents & string,
    accept: string = 'image/*'
  ) => {
    const file = formData.documents?.[name] as File | undefined;
    const fileName = file ? file.name : '';
    
    return (
      <div className="block mb-5">
        <span className="text-gray-700 font-medium block mb-1">{label}</span>
        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-50 border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            {fileName ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{fileName}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to select {label.toLowerCase()}
                </span>
              </>
            )}
          </div>
          <input 
            type="file"
            name={name}
            accept={accept}
            onChange={(e) => handleFileChange(e, name)}
            className="hidden"
          />
        </label>
      </div>
    );
  };

  // Document Upload Section
  const renderDocumentCheckbox = (id: string, label: string, name: string) => (
    <li className="flex items-center gap-2 mb-2">
      <input 
        type="checkbox" 
        id={id} 
        name={name}
        onChange={handleChange}
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <label htmlFor={id} className="text-gray-700">• {label}</label>
    </li>
  );

  // Session Information Section
  const SessionSection: React.FC<FormSectionProps> = ({ formData, handleChange }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Session Information</h3>
      
      {/* Admit Session */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Admit Group</label>
          <input
            type="text"
            name="admitSession.group"
            value={formData.admitSession.group}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admit Class</label>
          <input
            type="text"
            name="admitSession.class"
            value={formData.admitSession.class}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admit Section</label>
          <input
            type="text"
            name="admitSession.section"
            value={formData.admitSession.section}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admit Roll No</label>
          <input
            type="text"
            name="admitSession.rollNo"
            value={formData.admitSession.rollNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Current Session */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Group</label>
          <input
            type="text"
            name="currentSession.group"
            value={formData.currentSession.group}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Class</label>
          <input
            type="text"
            name="currentSession.class"
            value={formData.currentSession.class}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Section</label>
          <input
            type="text"
            name="currentSession.section"
            value={formData.currentSession.section}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Roll No</label>
          <input
            type="text"
            name="currentSession.rollNo"
            value={formData.currentSession.rollNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stream</label>
          <input
            type="text"
            name="currentSession.stream"
            value={formData.currentSession.stream}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <input
            type="text"
            name="currentSession.semester"
            value={formData.currentSession.semester}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fee Group</label>
          <input
            type="text"
            name="currentSession.feeGroup"
            value={formData.currentSession.feeGroup}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">House</label>
          <input
            type="text"
            name="currentSession.house"
            value={formData.currentSession.house}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Address Section
  const AddressSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Address Details</h3>
      
      {/* Present Address */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-4">Present Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInput('House No.', 'houseNo', 'text')}
          {renderInput('Street/Area', 'street', 'text')}
          {renderInput('City', 'city', 'text', true)}
          {renderInput('State', 'state', 'text', true)}
          {renderInput('Pin Code', 'pinCode', 'text', true, '6 digits')}
        </div>
      </div>

      {/* Same as Present Address Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sameAsPresentAddress"
          name="sameAsPresentAddress"
          checked={formData.sameAsPresentAddress}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="sameAsPresentAddress" className="text-gray-700">
          Permanent Address same as Present Address
        </label>
      </div>

      {/* Permanent Address */}
      {!formData.sameAsPresentAddress && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Permanent Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('House No.', 'permanentHouseNo', 'text')}
            {renderInput('Street/Area', 'permanentStreet', 'text')}
            {renderInput('City', 'permanentCity', 'text')}
            {renderInput('State', 'permanentState', 'text')}
            {renderInput('Pin Code', 'permanentPinCode', 'text', false, '6 digits')}
          </div>
        </div>
      )}
    </div>
  );

  // Different form sections based on currentStep
  const formSections: { [key: number]: JSX.Element } = {
    // Step 1: Student Information
    1: (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">Student Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInput('Admission No', 'admissionNo', 'text', true)}
          {renderInput('PEN No', 'penNo', 'text')}
          {renderInput('Apaar ID', 'apaarId', 'text', false)}
          {renderInput('Full Name', 'fullName', 'text', true, 'Enter name in BLOCK LETTERS')}
          {renderInput('Admission Date', 'admissionDate', 'date', false)}
          {renderInput('SR No / Student ID', 'studentId')}
          {renderInput('Date of Birth', 'dateOfBirth', 'date', false)}
          {renderInput('Age', 'age', 'number', false, 'Auto-calculated from date of birth', undefined, { inputMode: 'numeric' }, true)}
          {renderInput('Height (cm)', 'height', 'number', false, '', undefined, { inputMode: 'numeric' })}
          {renderInput('Weight (kg)', 'weight', 'number', false, '', undefined, { inputMode: 'numeric' })}
          {renderInput('Religion', 'religion')}
          {renderSelect('Gender', 'gender', [
            { value: '', label: 'Select Gender' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' }
          ], false)}
          {renderSelect('Category', 'category', [
            { value: '', label: 'Select Category' },
            { value: 'SC', label: 'SC' },
            { value: 'ST', label: 'ST' },
            { value: 'BC', label: 'BC' },
            { value: 'OBC', label: 'OBC' },
            { value: 'GEN', label: 'General' },
            { value: 'EWS', label: 'EWS' }
          ], false)}
          {renderSelect('Blood Group', 'bloodGroup', [
            { value: '', label: 'Select Blood Group' },
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' }
          ])}
          {renderSelect('Belong to BPL', 'belongToBPL', [
            { value: '', label: 'Select BPL Status' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ])}
          {renderInput('Type of Disability', 'disability')}
          {renderInput('Nationality', 'nationality', 'text', false)}
          {renderInput('Aadhar Number', 'aadhaarNumber', 'text', false, '12-digit Aadhaar number', undefined, {
            pattern: '^[0-9]{12}$',
            inputMode: 'numeric'
          })}
        </div>
      </div>
    ),
    
    // Step 2: Academic Information
    2: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Admission Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSelect('Group', 'admitSession.group', [
              { value: '', label: 'Select Group' },
              { value: 'Primary', label: 'Primary' },
              { value: 'Secondary', label: 'Secondary' },
              { value: 'Senior Secondary', label: 'Senior Secondary' }
            ])}
            {renderSelect('Stream', 'admitSession.stream', [
              { value: '', label: 'Select Stream' },
              { value: 'Science', label: 'Science' },
              { value: 'Commerce', label: 'Commerce' },
              { value: 'Arts', label: 'Arts' },
              { value: 'Vocational', label: 'Vocational' }
            ])}
            {renderSelect('Class', 'admitSession.class', [
              { value: '', label: 'Select Class' },
              { value: 'Nursery', label: 'Nursery' },
              { value: 'LKG', label: 'LKG' },
              { value: 'UKG', label: 'UKG' },
              { value: 'Class 1', label: 'Class 1' },
              { value: 'Class 2', label: 'Class 2' },
              { value: 'Class 3', label: 'Class 3' },
              { value: 'Class 4', label: 'Class 4' },
              { value: 'Class 5', label: 'Class 5' },
              { value: 'Class 6', label: 'Class 6' },
              { value: 'Class 7', label: 'Class 7' },
              { value: 'Class 8', label: 'Class 8' },
              { value: 'Class 9', label: 'Class 9' },
              { value: 'Class 10', label: 'Class 10' },
              { value: 'Class 11', label: 'Class 11' },
              { value: 'Class 12', label: 'Class 12' }
            ], true)}
            {renderSelect('Section', 'admitSession.section', [
              { value: '', label: 'Select Section' },
              ...['A', 'B', 'C', 'D'].map(section => ({ 
                value: section, label: section 
              }))
            ])}
            {renderInput('Roll No.', 'admitSession.rollNo')}
            {renderInput('Semester', 'admitSession.semester')}
            {renderInput('Fee Group', 'admitSession.feeGroup')}
            {renderInput('House', 'admitSession.house')}
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Current Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Group', 'currentSession.group')}
            {renderSelect('Stream', 'currentSession.stream', [
              { value: '', label: 'Select Stream' },
              ...['Science', 'Commerce', 'Arts', 'Vocational', 'General'].map(stream => ({ 
                value: stream.toLowerCase(), label: stream 
              }))
            ])}
            {renderSelect('Class', 'currentSession.class', [
              { value: '', label: 'Select Class' },
              ...['Nursery',
                  'LKG',
                  'UKG',
                  'Class 1',
                  'Class 2',
                  'Class 3',
                  'Class 4',
                  'Class 5',
                  'Class 6',
                  'Class 7',
                  'Class 8',
                  'Class 9',
                  'Class 10',
                  'Class 11 (Science)',
                  'Class 11 (Commerce)',
                  'Class 11 (Arts)',
                  'Class 12 (Science)',
                  'Class 12 (Commerce)',
                  'Class 12 (Arts)'].map(cls => ({ 
                value: cls, label: cls 
              }))
            ])}
            {renderSelect('Section', 'currentSession.section', [
              { value: '', label: 'Select Section' },
              ...['A', 'B', 'C', 'D'].map(section => ({ 
                value: section, label: section 
              }))
            ])}
            {renderInput('Roll No.', 'currentSession.rollNo')}
            {renderInput('Semester', 'currentSession.semester')}
            {renderInput('Fee Group', 'currentSession.feeGroup')}
            {renderInput('House', 'currentSession.house')}
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Other Academic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Academic Registration No', 'academic.registrationNo')}
          </div>
        </div>
      </div>
    ),
    
    // Step 3: Contact Information
    3: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Mobile Number', 'mobileNumber', 'tel', true, '10-digit mobile number', undefined, {
              pattern: '^[0-9]{10}$',
              inputMode: 'numeric'
            })}
            {renderInput('Student Email', 'email', 'email', true)}
            {renderInput('Student Email Password', 'emailPassword', 'password', true)}
            {renderInput('Father\'s Mobile', 'father.contactNumber', 'tel', true, '10-digit mobile number', undefined, {
              pattern: '^[0-9]{10}$',
              inputMode: 'numeric'
            })}
            {renderInput('Mother\'s Mobile', 'mother.contactNumber', 'tel', true, '10-digit mobile number', undefined, {
              pattern: '^[0-9]{10}$',
              inputMode: 'numeric'
            })}
            {renderInput('Emergency Contact', 'emergencyContact', 'tel', true, '10-digit mobile number', undefined, {
              pattern: '^[0-9]{10}$',
              inputMode: 'numeric'
            })}
            {renderInput('Father\'s Email', 'father.email', 'email', true)}
            {renderInput('Father\'s Email Password', 'father.emailPassword', 'password', true)}
            {renderInput('Mother\'s Email', 'mother.email', 'email')}
            {renderInput('Mother\'s Email Password', 'mother.emailPassword', 'password')}
          </div>
        </div>
      </div>
    ),
    
    // Step 4: Address and Transport (Modified with present and permanent address)
    4: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Present Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('House/Flat No.', 'address.houseNo')}
            {renderTextarea('Street/Area', 'address.street')}
            {renderInput('City', 'address.city', 'text', true, 'Enter city name')}
            {renderSelect('State', 'address.state', [
              { value: '', label: 'Select State' },
              ...['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'].map(state => ({
                value: state, label: state
              }))
            ], true, 'Select your state')}
            {renderInput('PIN Code', 'address.pinCode')}
          </div>
        </div>

        {/* Checkbox for same as present address */}
        <div className="flex items-center my-4">
          <input
            type="checkbox"
            id="sameAsPresentAddress"
            name="address.sameAsPresentAddress"
            checked={formData.address.sameAsPresentAddress}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="sameAsPresentAddress" className="ml-2 block text-gray-700">
            Same as Present Address
          </label>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Permanent Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('House/Flat No.', 'address.permanentHouseNo')}
            {renderTextarea('Street/Area', 'address.permanentStreet')}
            {renderInput('City', 'address.permanentCity')}
            {renderSelect('State', 'address.permanentState', [
              { value: '', label: 'Select State' },
              ...['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'].map(state => ({
                value: state, label: state
              }))
            ])}
            {renderInput('PIN Code', 'address.permanentPinCode')}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Transport Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSelect('Transport Mode', 'transport.mode', [
              { value: '', label: 'Select Mode' },
              { value: 'Bus', label: 'School Bus' },
              { value: 'Van', label: 'School Van' },
              { value: 'Auto', label: 'Auto Rickshaw' },
              { value: 'Private', label: 'Private Vehicle' },
              { value: 'Walking', label: 'Walking' }
            ])}
            
            {/* Show these fields only if Bus, Van, or Auto is selected */}
            {['Bus', 'Van', 'Auto'].includes(formData.transport?.mode) && (
              <>
                {renderInput('Area', 'transport.area', 'text', true)}
                {renderInput('Stand', 'transport.stand', 'text', true)}
                {renderSelect('Route', 'transport.route', [
                  { value: '', label: 'Select Route' },
                  ...(transportRoutes || []).map(route => ({
                    value: route.id,
                    label: `${route.name} (${route.fromLocation} - ${route.toLocation})`
                  }))
                ], true)}
                {renderSelect('Driver', 'transport.driver', [
                  { value: '', label: 'Select Driver' },
                  ...(drivers || []).map(driver => ({
                    value: driver.id,
                    label: `${driver.name} (${driver.contactNumber})`
                  }))
                ], true)}
                {renderInput('Pickup Location', 'transport.pickupLocation', 'text', true)}
                {renderInput('Drop Location', 'transport.dropLocation', 'text', true)}
              </>
            )}
          </div>
        </div>
      </div>
    ),
    
    // Step 5: Parents & Guardian
    5: (
      <div className="space-y-8">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Father's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Name', 'father.name', 'text', true)}
            {renderInput('Qualification', 'father.qualification')}
            {renderInput('Occupation', 'father.occupation')}
            {renderInput('Organization', 'father.organization')}
            {renderInput('Designation', 'father.designation')}
            {renderInput('Mobile Number', 'father.contactNumber', 'tel', false, '10-digit mobile number', undefined, {
              pattern: '^[0-9]{10}$',
              inputMode: 'numeric'
            })}
            {renderInput('Office Contact', 'father.officeContact', 'tel', false, 'Office number with extension')}
            {renderInput('Email', 'father.email', 'email')}
            {renderInput('Aadhar Number', 'father.aadhaarNo', 'text', false, '12-digit Aadhaar number', undefined, {
              pattern: '^[0-9]{12}$',
              inputMode: 'numeric'
            })}
            {renderInput('Annual Income', 'father.annualIncome', 'number', false, 'Annual income in Rs.', undefined, {
              inputMode: 'numeric'
            })}
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Mother's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Name', 'mother.name', 'text', false)}
            {renderInput('Qualification', 'mother.qualification')}
            {renderInput('Occupation', 'mother.occupation')}
            {renderInput('Email', 'mother.email', 'email')}
            {renderInput('Aadhar Number', 'mother.aadhaarNo', 'text', false, '12-digit Aadhaar number', undefined, {
              pattern: '^[0-9]{12}$',
              inputMode: 'numeric'
            })}
            {renderInput('Annual Income', 'mother.annualIncome', 'number', false, 'Annual income in Rs.', undefined, {
              inputMode: 'numeric'
            })}
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Guardian Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Guardian Name', 'guardian.name')}
            {renderTextarea('Guardian Address', 'guardian.address', false, 2)}
            {renderInput('Guardian Mobile', 'guardian.contactNumber', 'tel')}
            {renderInput('Guardian Email', 'guardian.email', 'email')}
            {renderInput('Guardian Aadhar No', 'guardian.aadhaarNo')}
            {renderInput('Guardian Occupation', 'guardian.occupation')}
            {renderInput('Guardian Annual Income', 'guardian.annualIncome')}
          </div>
        </div>
      </div>
    ),
    
    // Step 6: Document Upload
    6: (
      <div className="space-y-8">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">Document Upload</h3>
        <div className="grid grid-cols-1 gap-6">
          
          
          {/* File upload fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFileInput('Student Image', 'studentImage')}
            {renderFileInput('Father Image', 'fatherImage')}
            {renderFileInput('Mother Image', 'motherImage')}
            {renderFileInput('Guardian Image', 'guardianImage')}
            {renderFileInput('Student Signature', 'signature')}
            {renderFileInput('Parent Signature', 'parentSignature')}
            {renderFileInput('Birth Certificate', 'birthCertificate', 'application/pdf,image/*')}
            {renderFileInput('Transfer Certificate', 'transferCertificate', 'application/pdf,image/*')}
            {renderFileInput('Mark Sheet', 'markSheet', 'application/pdf,image/*')}
            {renderFileInput('Student Aadhar Card', 'aadhaarCard', 'application/pdf,image/*')}
            {renderFileInput('Father Aadhar Card', 'fatherAadhar', 'application/pdf,image/*')}
            {renderFileInput('Mother Aadhar Card', 'motherAadhar', 'application/pdf,image/*')}
            {renderFileInput('Family ID', 'familyId', 'application/pdf,image/*')}
          </div>
        </div>
      </div>
    ),
    
    // Step 7: Declaration and Office Use
    7: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Declaration</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              I hereby declare that the above information including Name of the Candidate, Father's, Guardian's, Mother's and Date of Birth furnished by me is correct to the best of my knowledge and belief. I shall abide by the rules of the school.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderFileInput('Father\'s Signature', 'fatherSignature')}
            {renderFileInput('Mother\'s Signature', 'motherSignature')}
            {renderFileInput('Guardian\'s Signature', 'guardianSignature')}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">For Office Use Only</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Admission Number', 'office.admissionNo')}
            {renderInput('Admission Date', 'office.admissionDate', 'date')}
            {renderInput('Admitted Class', 'office.admittedClass')}
            {renderInput('Receipt Number', 'office.receiptNo')}
            {renderSelect('Payment Mode', 'office.paymentMode', [
              { value: '', label: 'Select Payment Mode' },
              { value: 'cash', label: 'Cash' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'dd', label: 'Demand Draft' },
              { value: 'online', label: 'Online Transfer' }
            ])}
            {renderInput('Paid Amount', 'office.paidAmount', 'number', false, 'Amount in Rs.', undefined, {
              inputMode: 'numeric'
            })}
            {renderInput('Checked By', 'office.checkedBy')}
            {renderInput('Verified By', 'office.verifiedBy')}
            {renderInput('Approved By', 'office.approvedBy')}
          </div>
        </div>
      </div>
    )
  };

  return formSections[currentStep] || <div>Step not found</div>;
};

export default StudentFormSections; 