import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  fullName: string;
  gender: string;
  formNo: string;
  dob: string;
  category: string;
  religion: string;
  registerForClass: string;
  admissionCategory: string;
  bloodGroup: string;
  regnDate: string;
  testDate: string;
  transactionNo: string;
  singleParent: boolean;
  contactNo: string;
  studentEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  studentAadharCardNo: string;
  regnCharge: string;
  examSubject: string;
  paymentStatus: string;
  fatherName: string;
  fatherMobileNo: string;
  smsAlert: boolean;
  fatherEmail: string;
  fatherAadharCardNo: string;
  isFatherCampusEmployee: boolean;
  motherName: string;
  motherMobileNo: string;
  motherAadharCardNo: string;
  casteCertificate: File | null;
  studentAadharCard: File | null;
  fatherAadharCard: File | null;
  motherAadharCard: File | null;
  previousClassMarksheet: File | null;
  transferCertificate: File | null;
  studentDateOfBirthCertificate: File | null;
}

// Add these validation functions after the FormData interface and before the component
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

const validateAadhar = (aadhar: string): boolean => {
  const aadharRegex = /^\d{12}$/;
  return aadharRegex.test(aadhar);
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    formNo: "",
    dob: "",
    category: "",
    religion: "",
    registerForClass: "",
    admissionCategory: "",
    bloodGroup: "",
    regnDate: "",
    testDate: "",
    transactionNo: "",
    singleParent: false,
    contactNo: "",
    studentEmail: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    studentAadharCardNo: "",
    regnCharge: "",
    examSubject: "",
    paymentStatus: "",
    fatherName: "",
    fatherMobileNo: "",
    smsAlert: false,
    fatherEmail: "",
    fatherAadharCardNo: "",
    isFatherCampusEmployee: false,
    motherName: "",
    motherMobileNo: "",
    motherAadharCardNo: "",
    casteCertificate: null,
    studentAadharCard: null,
    fatherAadharCard: null,
    motherAadharCard: null,
    previousClassMarksheet: null,
    transferCertificate: null,
    studentDateOfBirthCertificate: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    contactNo?: string;
    studentEmail?: string;
    pincode?: string;
    studentAadharCardNo?: string;
    fatherAadharCardNo?: string;
    motherAadharCardNo?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    // Contact Number validation
    if (formData.contactNo && !validatePhoneNumber(formData.contactNo)) {
      errors.contactNo = "Please enter a valid 10-digit mobile number starting with 6-9";
      isValid = false;
    }

    // Email validation
    if (formData.studentEmail && !validateEmail(formData.studentEmail)) {
      errors.studentEmail = "Please enter a valid email address";
      isValid = false;
    }

    // Pincode validation
    if (formData.pincode && !validatePincode(formData.pincode)) {
      errors.pincode = "Please enter a valid 6-digit pincode";
      isValid = false;
    }

    // Aadhar Card validations
    if (formData.studentAadharCardNo && !validateAadhar(formData.studentAadharCardNo)) {
      errors.studentAadharCardNo = "Please enter a valid 12-digit Aadhar number";
      isValid = false;
    }

    if (formData.fatherAadharCardNo && !validateAadhar(formData.fatherAadharCardNo)) {
      errors.fatherAadharCardNo = "Please enter a valid 12-digit Aadhar number";
      isValid = false;
    }

    if (formData.motherAadharCardNo && !validateAadhar(formData.motherAadharCardNo)) {
      errors.motherAadharCardNo = "Please enter a valid 12-digit Aadhar number";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files?.[0] || null : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.formNo || !formData.fullName || !formData.contactNo || !formData.registerForClass || 
        !formData.city || !formData.state || !formData.fatherName || !formData.motherName) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Run all validations
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Map form fields to match backend expectations
      const mappedData = {
        // Basic student info
        admissionNo: formData.formNo.trim(), // Trim whitespace
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        mobileNumber: formData.contactNo.trim(),
        email: formData.studentEmail?.trim() || '',
        className: formData.registerForClass.trim(),
        section: formData.admissionCategory || 'A', // Default to 'A' if not provided
        
        // Address info
        'address.city': formData.city.trim(),
        'address.state': formData.state.trim(),
        'address.pinCode': formData.pincode?.trim() || '',
        
        // Parent info
        'father.name': formData.fatherName.trim(),
        'father.contactNumber': formData.fatherMobileNo?.trim() || '',
        'father.email': formData.fatherEmail?.trim() || '',
        'father.aadhaarNo': formData.fatherAadharCardNo?.trim() || '',
        'father.isCampusEmployee': formData.isFatherCampusEmployee ? 'yes' : 'no',
        
        'mother.name': formData.motherName.trim(),
        'mother.contactNumber': formData.motherMobileNo?.trim() || '',
        'mother.aadhaarNo': formData.motherAadharCardNo?.trim() || '',
        
        // Other fields
        category: formData.category || 'General',
        religion: formData.religion || 'Other',
        aadhaarNumber: formData.studentAadharCardNo?.trim() || '',
        regnDate: formData.regnDate || new Date().toISOString().split('T')[0],
        testDate: formData.testDate || '',
        transactionNo: formData.transactionNo?.trim() || '',
        regnCharge: formData.regnCharge?.trim() || '0',
        examSubject: formData.examSubject?.trim() || '',
        paymentStatus: formData.paymentStatus?.trim() || 'Pending',
        singleParent: formData.singleParent ? 'yes' : 'no',
        smsAlert: formData.smsAlert ? 'yes' : 'no',
      };

      // Add all mapped fields to FormData
      Object.entries(mappedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });

      // Add document files
      if (formData.casteCertificate) {
        formDataToSend.append('documents.casteCertificate', formData.casteCertificate);
      }
      if (formData.studentAadharCard) {
        formDataToSend.append('documents.studentAadharCard', formData.studentAadharCard);
      }
      if (formData.fatherAadharCard) {
        formDataToSend.append('documents.fatherAadharCard', formData.fatherAadharCard);
      }
      if (formData.motherAadharCard) {
        formDataToSend.append('documents.motherAadharCard', formData.motherAadharCard);
      }
      if (formData.previousClassMarksheet) {
        formDataToSend.append('documents.previousClassMarksheet', formData.previousClassMarksheet);
      }
      if (formData.transferCertificate) {
        formDataToSend.append('documents.transferCertificate', formData.transferCertificate);
      }
      if (formData.studentDateOfBirthCertificate) {
        formDataToSend.append('documents.studentDateOfBirthCertificate', formData.studentDateOfBirthCertificate);
      }

      // Add required schoolId
      formDataToSend.append('schoolId', '1');

      const response = await fetch(
        'http://localhost:5000/api/students',
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }
        throw new Error(data.message || 'Failed to submit registration');
      }

      if (data.success) {
        alert("Registration submitted successfully!");
        // Reset form after successful submission
        setFormData({
          fullName: "",
          gender: "",
          formNo: "",
          dob: "",
          category: "",
          religion: "",
          registerForClass: "",
          admissionCategory: "",
          bloodGroup: "",
          regnDate: "",
          testDate: "",
          transactionNo: "",
          singleParent: false,
          contactNo: "",
          studentEmail: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          studentAadharCardNo: "",
          regnCharge: "",
          examSubject: "",
          paymentStatus: "",
          fatherName: "",
          fatherMobileNo: "",
          smsAlert: false,
          fatherEmail: "",
          fatherAadharCardNo: "",
          isFatherCampusEmployee: false,
          motherName: "",
          motherMobileNo: "",
          motherAadharCardNo: "",
          casteCertificate: null,
          studentAadharCard: null,
          fatherAadharCard: null,
          motherAadharCard: null,
          previousClassMarksheet: null,
          transferCertificate: null,
          studentDateOfBirthCertificate: null,
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      alert("Failed to submit registration: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <div className="text-center py-10">Submitting...</div>;
  // if (error)
  //   return (
  //     <div className="text-center py-10 text-red-500">
  //       {error}. Please ensure the backend server is running at
  //       http://localhost:5000.
  //     </div>
  //   );

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        STUDENT REGISTRATION
      </h1>
      <form onSubmit={handleSubmit}>
      {/* Student Information Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Student Information
        </h2>
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form No
            </label>
            <input
              type="text"
              name="formNo"
              value={formData.formNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="Date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="Text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Religion
            </label>
            <select
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Religion</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Register For Class
            </label>
            <input
              type="text"
              name="registerForClass"
              value={formData.registerForClass}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Category
            </label>
            <input
              type="text"
              name="admissionCategory"
              value={formData.admissionCategory}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <input
              type="text"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date
            </label>
            <input
              type="Date"
              name="regnDate"
              value={formData.regnDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Date
            </label>
            <input
              type="Date"
              name="testDate"
              value={formData.testDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracsaction Number
            </label>
            <input
              type="text"
              name="transactionNo"
              value={formData.transactionNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.contactNo ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.contactNo && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contactNo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Email
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.studentEmail ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.studentEmail && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.studentEmail}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="Text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="Text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="Text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.pincode ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.pincode && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.pincode}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Aadhar Card Number
            </label>
            <input
              type="text"
              name="studentAadharCardNo"
              value={formData.studentAadharCardNo}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.studentAadharCardNo ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.studentAadharCardNo && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.studentAadharCardNo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Charge
            </label>
            <input
              type="Text"
              name="regnCharge"
              value={formData.regnCharge}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Subject
            </label>
            <input
              type="Text"
              name="examSubject"
              value={formData.examSubject}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <input
              type="Text"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Single Parent
            </label>
            <input
              type="checkbox"
              name="singleParent"
              checked={formData.singleParent}
              onChange={handleChange}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
     

      {/* Father Details Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Father Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Name
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Mobile No
            </label>
            <input
              type="text"
              name="fatherMobileNo"
              value={formData.fatherMobileNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Email
            </label>
            <input
              type="text"
              name="fatherEmail"
              value={formData.fatherEmail}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Aadhar Card No
            </label>
            <input
              type="text"
              name="fatherAadharCardNo"
              value={formData.fatherAadharCardNo}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.fatherAadharCardNo ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.fatherAadharCardNo && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.fatherAadharCardNo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS Alert
            </label>
            <input
              type="checkbox"
              name="smsAlert"
              checked={formData.smsAlert}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Father Campus Employee
            </label>
            <input
              type="checkbox"
              name="isFatherCampusEmployee"
              checked={formData.isFatherCampusEmployee}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Mother Details Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Mother Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Name
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Mobile No
            </label>
            <input
              type="text"
              name="motherMobileNo"
              value={formData.motherMobileNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Aadhar Card No
            </label>
            <input
              type="text"
              name="motherAadharCardNo"
              value={formData.motherAadharCardNo}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                validationErrors.motherAadharCardNo ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {validationErrors.motherAadharCardNo && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.motherAadharCardNo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caste Certificate
            </label>
            <input
              type="file"
              name="casteCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Aadhar Card
            </label>
            <input
              type="file"
              name="studentAadharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Aadhar Card
            </label>
            <input
              type="file"
              name="fatherAadharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Aadhar Card
            </label>
            <input
              type="file"
              name="motherAdharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Class Marksheet
            </label>
            <input
              type="file"
              name="previousClassMarksheet"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Certificate
            </label>
            <input
              type="file"
              name="transferCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Date of Birth Certificate
            </label>
            <input
              type="file"
              name="studentDateOfBirthCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => alert("Print Info")}
        >
          Print Info
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => alert("Print Form")}
        >
          Print Form
        </button>
        {loading ? (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Saving...
          </button>
        ) : (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            type="submit"
          >
            Save
          </button>
        )}
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          onClick={() =>
            setFormData({
              fullName: "",
              gender: "",
              formNo: "",
              dob: "",
              category: "",
              religion: "",
              registerForClass: "",
              admissionCategory: "",
              bloodGroup: "",
              regnDate: "",
              testDate: "",
              transactionNo: "",
              singleParent: false,
              contactNo: "",
              studentEmail: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              studentAadharCardNo: "",
              regnCharge: "",
              examSubject: "",
              paymentStatus: "",
              fatherName: "",
              fatherMobileNo: "",
              smsAlert: false,
              fatherEmail: "",
              fatherAadharCardNo: "",
              isFatherCampusEmployee: false,
              motherName: "",
              motherMobileNo: "",
              motherAadharCardNo: "",
              casteCertificate: null,
              studentAadharCard: null,
              fatherAadharCard: null,
              motherAadharCard: null,
              previousClassMarksheet: null,
              transferCertificate: null,
              studentDateOfBirthCertificate: null,
            })
          }
        >
          Reset
        </button>
      </div>
      </form>
    </div>
  );
};

export default StudentRegistration;
