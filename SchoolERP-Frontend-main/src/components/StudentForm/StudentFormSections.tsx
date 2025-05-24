import React from 'react';
import { StudentFormData, Documents } from './StudentFormTypes';

interface StudentFormSectionsProps {
  currentStep: number;
  formData: StudentFormData;
  validationErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof Documents) => void;
}

/**
 * Component that renders the appropriate form section based on current step
 */
const StudentFormSections: React.FC<StudentFormSectionsProps> = ({
  currentStep,
  formData,
  validationErrors,
  handleChange,
  handleFileChange
}) => {
  
  // Helper function to render input with validation
  const renderInput = (
    label: string, 
    name: string, 
    type: string = 'text', 
    required: boolean = false,
    placeholder: string = ''
  ) => {
    const error = name.includes('.') 
      ? validationErrors[name] 
      : validationErrors[name as keyof typeof validationErrors];
    
    // Safely get the value from nested path
    const getValue = (): string => {
      if (!name.includes('.')) {
        // For simple properties
        const val = formData[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        // For nested properties
        try {
          const parts = name.split('.');
          let value: any = { ...formData };
          
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
    
    // Special handling for date inputs
    const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === 'date' && 'showPicker' in HTMLInputElement.prototype) {
        // Use modern browsers' showPicker method if available
        (e.target as any).showPicker?.();
      }
    };
    
    return (
      <label className="block mb-5">
        <span className="text-gray-700 font-medium">{label} {required && <span className="text-red-500">*</span>}</span>
        <input
          type={type}
          name={name}
          value={getValue()}
          onChange={handleChange}
          onFocus={type === 'date' ? handleDateFocus : undefined}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all bg-gray-50 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          required={required}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </label>
    );
  };

  // Helper function to render select with validation
  const renderSelect = (
    label: string, 
    name: string, 
    options: { value: string; label: string }[], 
    required: boolean = false
  ) => {
    const error = name.includes('.') 
      ? validationErrors[name] 
      : validationErrors[name as keyof typeof validationErrors];
    
    // Reuse the same getValue function logic to maintain consistency
    const getValue = (): string => {
      if (!name.includes('.')) {
        // For simple properties
        const val = formData[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        // For nested properties
        try {
          const parts = name.split('.');
          let value: any = { ...formData };
          
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
    
    const currentValue = getValue();
    const placeholderText = `Select ${label}`;
    
    return (
      <label className="block mb-5">
        <span className="text-gray-700 font-medium">{label} {required && <span className="text-red-500">*</span>}</span>
        <select
          name={name}
          value={currentValue}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all bg-gray-50 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          required={required}
        >
          {/* Show placeholder option only if no value is selected */}
          {!currentValue && <option value="">{placeholderText}</option>}
          
          {/* Map through actual options (don't include the placeholder) */}
          {options.map((option) => 
            // Skip if this is the placeholder option that's already shown above
            (option.value !== '' || option.label !== placeholderText) && (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )
          )}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </label>
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
    const getValue = (): string => {
      if (!name.includes('.')) {
        // For simple properties
        const val = formData[name as keyof StudentFormData];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        // For nested properties
        try {
          const parts = name.split('.');
          let value: any = { ...formData };
          
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
          value={getValue()}
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
    name: keyof Documents, 
    accept: string = 'image/*'
  ) => {
    const file = formData.documents[name];
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

  // Different form sections based on currentStep
  const formSections: { [key: number]: JSX.Element } = {
    // Step 1: Basic Information
    1: (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">Student Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInput('Branch Name', 'branchName')}
          {renderInput('Admission No', 'admissionNo', 'text', true)}
          {renderInput('PEN No', 'penNo', 'text')}
          {renderInput('Full Name', 'fullName', 'text', true)}
          {renderInput('Admission Date', 'admissionDate', 'date', true)}
          {renderInput('SR No / Student ID', 'studentId')}
          {renderInput('Date of Birth', 'dateOfBirth', 'date', true)}
          {renderInput('Age', 'age', 'text', false, 'Auto-calculated')}
          {renderInput('Religion', 'religion')}
          {renderSelect('Gender', 'gender', [
            { value: '', label: 'Select Gender' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ], true)}
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
          {renderInput('Caste', 'caste')}
        </div>
      </div>
    ),
    
    // Step 2: Academic Information
    2: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Admit Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Group', 'admitSession.group')}
            {renderSelect('Stream', 'admitSession.stream', [
              { value: '', label: 'Select Stream' },
              ...['Science', 'Commerce', 'Arts', 'Vocational', 'General'].map(stream => ({ 
                value: stream.toLowerCase(), label: stream 
              }))
            ])}
            {renderSelect('Class', 'admitSession.class', [
              { value: '', label: 'Select Class' },
              ...['Nursery', 'LKG', 'UKG', 
                 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                 'Class 11', 'Class 12'].map(cls => ({ 
                value: cls, label: cls 
              }))
            ], true)}
            {renderSelect('Section', 'admitSession.section', [
              { value: '', label: 'Select Section' },
              ...['A', 'B', 'C', 'D'].map(section => ({ 
                value: section, label: section 
              }))
            ])}
            {renderInput('Roll No.', 'admitSession.rollNo')}
            {renderSelect('Semester', 'admitSession.semester', [
              { value: '', label: 'Select Semester' },
              { value: '1st sem', label: '1st Semester' },
              { value: '2nd sem', label: '2nd Semester' }
            ])}
            {renderInput('Fee Group', 'admitSession.feeGroup')}
            {renderInput('House', 'admitSession.house')}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Current Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Group', 'currentSession.group')}
            {renderSelect('Stream', 'stream', [
              { value: '', label: 'Select Stream' },
              ...['Science', 'Commerce', 'Arts', 'Vocational', 'General'].map(stream => ({ 
                value: stream.toLowerCase(), label: stream 
              }))
            ])}
            {renderSelect('Class', 'className', [
              { value: '', label: 'Select Class' },
              ...['Nursery', 'LKG', 'UKG', 
                 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                 'Class 11', 'Class 12'].map(cls => ({ 
                value: cls, label: cls 
              }))
            ], true)}
            {renderSelect('Section', 'section', [
              { value: '', label: 'Select Section' },
              ...['A', 'B', 'C', 'D'].map(section => ({ 
                value: section, label: section 
              }))
            ])}
            {renderInput('Roll No.', 'rollNumber')}
            {renderSelect('Semester', 'semester', [
              { value: '', label: 'Select Semester' },
              { value: '1st sem', label: '1st Semester' },
              { value: '2nd sem', label: '2nd Semester' }
            ])}
            {renderInput('Fee Group', 'currentSession.feeGroup')}
            {renderInput('House', 'currentSession.house')}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Registration No', 'academic.registrationNo')}
            {renderInput('Previous School', 'previousSchool')}
          </div>
        </div>
      </div>
    ),
    
    // Step 3: Contact Information (Transport moved to Address section)
    3: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Mobile Number', 'mobileNumber', 'tel', true)}
            {renderInput('Student Email', 'email', 'email')}
            {renderInput('Father\'s Mobile', 'father.contactNumber', 'tel')}
            {renderInput('Mother\'s Mobile', 'mother.contactNumber', 'tel')}
            {renderInput('Emergency Contact', 'emergencyContact', 'tel')}
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
            {renderInput('City', 'address.city', 'text', true)}
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
            ], true)}
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
              { value: 'school-bus', label: 'School Bus' },
              { value: 'own', label: 'Own Transport' },
              { value: 'public', label: 'Public Transport' },
              { value: 'walking', label: 'Walking' }
            ])}
            {renderInput('Area', 'transport.area')}
            {renderInput('Stand', 'transport.stand')}
            {renderInput('Route', 'transport.route')}
            {renderInput('Driver', 'transport.driver')}
            {renderInput('Pickup Location', 'transport.pickupLocation')}
            {renderInput('Drop Location', 'transport.dropLocation')}
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
            {renderInput('Email', 'father.email', 'email')}
            {renderInput('Aadhar Card No', 'father.aadhaarNo')}
            {renderInput('Annual Income', 'father.annualIncome')}
            {renderSelect('Is Campus Employee', 'father.isCampusEmployee', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Mother's Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Name', 'mother.name', 'text', true)}
            {renderInput('Qualification', 'mother.qualification')}
            {renderInput('Occupation', 'mother.occupation')}
            {renderInput('Email', 'mother.email', 'email')}
            {renderInput('Aadhar Card No', 'mother.aadhaarNo')}
            {renderInput('Annual Income', 'mother.annualIncome')}
            {renderSelect('Is Campus Employee', 'mother.isCampusEmployee', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-4">Guardian Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Guardian Name', 'guardian.name')}
            {renderTextarea('Guardian Address', 'guardian.address', false, 2)}
            {renderInput('Guardian Mobile', 'guardian.contactNumber', 'tel')}
          </div>
        </div>
      </div>
    ),
    
    // Step 6: Document Upload
    6: (
      <div className="space-y-8">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">Document Upload</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderFileInput('Student Image', 'studentImage')}
          {renderFileInput('Father Image', 'fatherImage')}
          {renderFileInput('Mother Image', 'motherImage')}
          {renderFileInput('Guardian Image', 'guardianImage')}
          {renderFileInput('Student Signature', 'signature')}
          {renderFileInput('Parent Signature', 'parentSignature')}
          {renderFileInput('Father Aadhar Card', 'fatherAadhar', 'application/pdf,image/*')}
          {renderFileInput('Mother Aadhar Card', 'motherAadhar', 'application/pdf,image/*')}
          {renderFileInput('Birth Certificate', 'birthCertificate', 'application/pdf,image/*')}
          {renderFileInput('Migration Certificate', 'migrationCertificate', 'application/pdf,image/*')}
          {renderFileInput('Aadhar Card', 'aadhaarCard', 'application/pdf,image/*')}
          {renderFileInput('Affidavit Certificate', 'affidavitCertificate', 'application/pdf,image/*')}
          {renderFileInput('Income Certificate', 'incomeCertificate', 'application/pdf,image/*')}
          {renderFileInput('Address Proof 1', 'addressProof1', 'application/pdf,image/*')}
          {renderFileInput('Address Proof 2', 'addressProof2', 'application/pdf,image/*')}
        </div>
      </div>
    ),
    
    // Step 7: Other Details
    7: (
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Other Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('Aadhar Card No', 'aadhaarNumber')}
            {renderSelect('Belong to BPL', 'other.belongToBPL', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderSelect('Minority', 'other.minority', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderInput('Type of Disability', 'other.disability')}
            {renderInput('Bank Account No', 'other.accountNo')}
            {renderInput('Bank', 'other.bank')}
            {renderInput('IFSC Code', 'other.ifscCode')}
            {renderSelect('Medium of Instruction', 'other.medium', [
              { value: '', label: 'Select Medium' },
              { value: 'english', label: 'English' },
              { value: 'hindi', label: 'Hindi' },
              { value: 'other', label: 'Other' }
            ])}
            {renderInput('Last Year Result', 'other.lastYearResult')}
            {renderSelect('Single Parent', 'other.singleParent', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderSelect('Only Child', 'other.onlyChild', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderSelect('Only Girl Child', 'other.onlyGirlChild', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderSelect('Adopted Child', 'other.adoptedChild', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderInput('Sibling Admission No', 'other.siblingAdmissionNo')}
            {renderSelect('Transfer Case', 'other.transferCase', [
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' }
            ])}
            {renderSelect('Living With', 'other.livingWith', [
              { value: '', label: 'Select' },
              { value: 'parents', label: 'Both Parents' },
              { value: 'father', label: 'Father' },
              { value: 'mother', label: 'Mother' },
              { value: 'guardian', label: 'Guardian' }
            ])}
            {renderInput('Mother Tongue', 'other.motherTongue')}
            {renderInput('Nationality', 'nationality')}
            {renderSelect('Admission Type', 'other.admissionType', [
              { value: 'new', label: 'New' },
              { value: 'old', label: 'Old' }
            ])}
            {renderInput('UDISE NO', 'other.udiseNo')}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Last Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('School', 'lastEducation.school')}
            {renderTextarea('Address', 'lastEducation.address', false, 2)}
            {renderInput('TC Date', 'lastEducation.tcDate', 'date')}
            {renderInput('Previous Class', 'lastEducation.prevClass')}
            {renderInput('CGPA/Percentage', 'lastEducation.percentage')}
            {renderInput('Attendance', 'lastEducation.attendance')}
            {renderTextarea('Extra Activities', 'lastEducation.extraActivity', false, 2)}
          </div>
        </div>
      </div>
    )
  };

  return formSections[currentStep] || <div>Step not found</div>;
};

export default StudentFormSections; 