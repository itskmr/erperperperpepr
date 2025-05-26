import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { STUDENT_API } from '../../config/api';

interface Student {
  id: string;
  // Student Information
  branchName: string;
  admissionNo: string;
  penNo: string;
  apaarId: string;
  fullName: string;
  srNo: string;
  dateOfBirth: string | null;
  tcDate: string | null;
  admissionDate: string | null;
  age: number;
  height: number;
  weight: number;
  gender: string;
  bloodGroup: string;
  religion: string;
  category: string;
  belongToBPL: string;
  typeOfDisability: string;
  nationality: string;
  aadhaarNumber: string;

  // Contact Information
  mobileNumber: string;
  email: string;
  studentEmailPassword: string;
  emergencyContact: string;
  fatherMobile: string;
  motherMobile: string;
  fatherEmail: string;
  fatherEmailPassword: string;
  motherEmail: string;
  motherEmailPassword: string;

  // Address Information
  presentAddress: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  permanentAddress: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  sameAsPresentAddress: boolean;

  // Parent Information
  fatherDetails: {
    name: string;
    qualification: string;
    occupation: string;
    organization: string;
    designation: string;
    mobileNumber: string;
    officeContact: string;
    email: string;
    aadhaarNumber: string;
    annualIncome: string;
  };
  motherDetails: {
    name: string;
    qualification: string;
    occupation: string;
    email: string;
    aadhaarNumber: string;
    annualIncome: string;
  };
  guardianDetails: {
    name: string;
    address: string;
    mobile: string;
    email: string;
    aadhaarNumber: string;
    occupation: string;
    annualIncome: string;
  };

  // Academic Information
  admitSession: {
    group: string;
    stream: string;
    class: string;
    section: string;
    rollNo: string;
    semester: string;
    feeGroup: string;
    house: string;
  };
  currentSession: {
    group: string;
    stream: string;
    class: string;
    section: string;
    rollNo: string;
    semester: string;
    feeGroup: string;
    house: string;
  };

  // Previous Education
  previousEducation: {
    school: string;
    schoolAddress: string;
    tcDate: string | null;
    previousClass: string;
    percentage: string;
    attendance: string;
    extraActivities: string;
  };

  // Academic Details
  registrationNo: string;

  // Transport Details
  transportMode: string;

  // Document Information
  documents: {
    studentImage: string;
    fatherImage: string;
    motherImage: string;
    guardianImage: string;
    studentSignature: string;
    parentSignature: string;
    birthCertificate: string;
    transferCertificate: string;
    markSheet: string;
    studentAadhaar: string;
    fatherAadhaar: string;
    motherAadhaar: string;
    familyId: string;
    fatherSignature: string;
    motherSignature: string;
    guardianSignature: string;
  };
}

interface StudentEditProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
}

const AVAILABLE_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const STREAMS = ['Science', 'Commerce', 'Arts', 'General'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'EWS', label: 'Economically Weaker Section (EWS)' },
  { value: 'OBC', label: 'Other Backward Class (OBC)' },
  { value: 'BC', label: 'Backward Class (BC)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' }
];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
const TRANSPORT_MODES = ['School Bus', 'Private Vehicle', 'Public Transport', 'Walking'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];
const BPL_OPTIONS = ['Yes', 'No'];

const StudentEdit: React.FC<StudentEditProps> = ({ student, isOpen, onClose, onStudentUpdated }) => {
  const [formData, setFormData] = useState<Student>({
    ...student,
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    tcDate: student.tcDate ? new Date(student.tcDate).toISOString().split('T')[0] : '',
    admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
    presentAddress: {
      houseNo: student.presentAddress?.houseNo || '',
      street: student.presentAddress?.street || '',
      city: student.presentAddress?.city || '',
      state: student.presentAddress?.state || '',
      pinCode: student.presentAddress?.pinCode || ''
    },
    permanentAddress: {
      houseNo: student.permanentAddress?.houseNo || '',
      street: student.permanentAddress?.street || '',
      city: student.permanentAddress?.city || '',
      state: student.permanentAddress?.state || '',
      pinCode: student.permanentAddress?.pinCode || ''
    },
    fatherDetails: {
      name: student.fatherDetails?.name || '',
      qualification: student.fatherDetails?.qualification || '',
      occupation: student.fatherDetails?.occupation || '',
      organization: student.fatherDetails?.organization || '',
      designation: student.fatherDetails?.designation || '',
      mobileNumber: student.fatherDetails?.mobileNumber || '',
      officeContact: student.fatherDetails?.officeContact || '',
      email: student.fatherDetails?.email || '',
      aadhaarNumber: student.fatherDetails?.aadhaarNumber || '',
      annualIncome: student.fatherDetails?.annualIncome || ''
    },
    motherDetails: {
      name: student.motherDetails?.name || '',
      qualification: student.motherDetails?.qualification || '',
      occupation: student.motherDetails?.occupation || '',
      email: student.motherDetails?.email || '',
      aadhaarNumber: student.motherDetails?.aadhaarNumber || '',
      annualIncome: student.motherDetails?.annualIncome || ''
    },
    guardianDetails: {
      name: student.guardianDetails?.name || '',
      address: student.guardianDetails?.address || '',
      mobile: student.guardianDetails?.mobile || '',
      email: student.guardianDetails?.email || '',
      aadhaarNumber: student.guardianDetails?.aadhaarNumber || '',
      occupation: student.guardianDetails?.occupation || '',
      annualIncome: student.guardianDetails?.annualIncome || ''
    },
    admitSession: {
      group: student.admitSession?.group || '',
      stream: student.admitSession?.stream || '',
      class: student.admitSession?.class || '',
      section: student.admitSession?.section || '',
      rollNo: student.admitSession?.rollNo || '',
      semester: student.admitSession?.semester || '',
      feeGroup: student.admitSession?.feeGroup || '',
      house: student.admitSession?.house || ''
    },
    currentSession: {
      group: student.currentSession?.group || '',
      stream: student.currentSession?.stream || '',
      class: student.currentSession?.class || '',
      section: student.currentSession?.section || '',
      rollNo: student.currentSession?.rollNo || '',
      semester: student.currentSession?.semester || '',
      feeGroup: student.currentSession?.feeGroup || '',
      house: student.currentSession?.house || ''
    },
    previousEducation: {
      school: student.previousEducation?.school || '',
      schoolAddress: student.previousEducation?.schoolAddress || '',
      tcDate: student.previousEducation?.tcDate || null,
      previousClass: student.previousEducation?.previousClass || '',
      percentage: student.previousEducation?.percentage || '',
      attendance: student.previousEducation?.attendance || '',
      extraActivities: student.previousEducation?.extraActivities || ''
    },
    documents: {
      studentImage: student.documents?.studentImage || '',
      fatherImage: student.documents?.fatherImage || '',
      motherImage: student.documents?.motherImage || '',
      guardianImage: student.documents?.guardianImage || '',
      studentSignature: student.documents?.studentSignature || '',
      parentSignature: student.documents?.parentSignature || '',
      birthCertificate: student.documents?.birthCertificate || '',
      transferCertificate: student.documents?.transferCertificate || '',
      markSheet: student.documents?.markSheet || '',
      studentAadhaar: student.documents?.studentAadhaar || '',
      fatherAadhaar: student.documents?.fatherAadhaar || '',
      motherAadhaar: student.documents?.motherAadhaar || '',
      familyId: student.documents?.familyId || '',
      fatherSignature: student.documents?.fatherSignature || '',
      motherSignature: student.documents?.motherSignature || '',
      guardianSignature: student.documents?.guardianSignature || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Student] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format dates for submission
      const submissionData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        tcDate: formData.tcDate ? new Date(formData.tcDate).toISOString() : null,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate).toISOString() : null
      };

      const response = await fetch(`${STUDENT_API.UPDATE}/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update student');
      }

      onStudentUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Edit Student Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Student Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Admission No</label>
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">PEN No</label>
                  <input
                    type="text"
                    name="penNo"
                    value={formData.penNo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">APAAR ID</label>
                  <input
                    type="text"
                    name="apaarId"
                    value={formData.apaarId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">SR No / Student ID</label>
                  <input
                    type="text"
                    name="srNo"
                    value={formData.srNo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Belong to BPL</label>
                  <select
                    name="belongToBPL"
                    value={formData.belongToBPL}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="">Select Option</option>
                    {BPL_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Type of Disability</label>
                  <input
                    type="text"
                    name="typeOfDisability"
                    value={formData.typeOfDisability}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    maxLength={12}
                    pattern="\d{12}"
                    title="Please enter a valid 12-digit Aadhaar number"
                  />
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Student Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Student Email Password</label>
                  <input
                    type="password"
                    name="studentEmailPassword"
                    value={formData.studentEmailPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Father's Mobile</label>
                  <input
                    type="tel"
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mother's Mobile</label>
                  <input
                    type="tel"
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Father's Email</label>
                  <input
                    type="email"
                    name="fatherEmail"
                    value={formData.fatherEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Father's Email Password</label>
                  <input
                    type="password"
                    name="fatherEmailPassword"
                    value={formData.fatherEmailPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mother's Email</label>
                  <input
                    type="email"
                    name="motherEmail"
                    value={formData.motherEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mother's Email Password</label>
                  <input
                    type="password"
                    name="motherEmailPassword"
                    value={formData.motherEmailPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Address Information</h3>
              <div className="space-y-4">
                {/* Present Address */}
                <div>
                  <h4 className="text-md font-medium mb-2">Present Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">House/Flat No.</label>
                      <input
                        type="text"
                        name="presentAddress.houseNo"
                        value={formData.presentAddress.houseNo}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Street/Area</label>
                      <textarea
                        name="presentAddress.street"
                        value={formData.presentAddress.street}
                        onChange={handleChange}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">City</label>
                      <input
                        type="text"
                        name="presentAddress.city"
                        value={formData.presentAddress.city}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">State</label>
                      <select
                        name="presentAddress.state"
                        value={formData.presentAddress.state}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300"
                        required
                      >
                        <option value="">Select your state</option>
                        {STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">PIN Code</label>
                      <input
                        type="text"
                        name="presentAddress.pinCode"
                        value={formData.presentAddress.pinCode}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Same as Present Address Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sameAsPresentAddress"
                    checked={formData.sameAsPresentAddress}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-600">
                    Same as Present Address
                  </label>
                </div>

                {/* Permanent Address */}
                {!formData.sameAsPresentAddress && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Permanent Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">House/Flat No.</label>
                        <input
                          type="text"
                          name="permanentAddress.houseNo"
                          value={formData.permanentAddress.houseNo}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Street/Area</label>
                        <textarea
                          name="permanentAddress.street"
                          value={formData.permanentAddress.street}
                          onChange={handleChange}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">City</label>
                        <input
                          type="text"
                          name="permanentAddress.city"
                          value={formData.permanentAddress.city}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">State</label>
                        <select
                          name="permanentAddress.state"
                          value={formData.permanentAddress.state}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300"
                        >
                          <option value="">Select State</option>
                          {STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">PIN Code</label>
                        <input
                          type="text"
                          name="permanentAddress.pinCode"
                          value={formData.permanentAddress.pinCode}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300"
                          pattern="[0-9]{6}"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Parent Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Parent Information</h3>
              
              {/* Father's Details */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Father's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <input
                      type="text"
                      name="fatherDetails.name"
                      value={formData.fatherDetails.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Qualification</label>
                    <input
                      type="text"
                      name="fatherDetails.qualification"
                      value={formData.fatherDetails.qualification}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Occupation</label>
                    <input
                      type="text"
                      name="fatherDetails.occupation"
                      value={formData.fatherDetails.occupation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Organization</label>
                    <input
                      type="text"
                      name="fatherDetails.organization"
                      value={formData.fatherDetails.organization}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Designation</label>
                    <input
                      type="text"
                      name="fatherDetails.designation"
                      value={formData.fatherDetails.designation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                    <input
                      type="tel"
                      name="fatherDetails.mobileNumber"
                      value={formData.fatherDetails.mobileNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Office Contact</label>
                    <input
                      type="text"
                      name="fatherDetails.officeContact"
                      value={formData.fatherDetails.officeContact}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      placeholder="Office number with extension"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      name="fatherDetails.email"
                      value={formData.fatherDetails.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                    <input
                      type="text"
                      name="fatherDetails.aadhaarNumber"
                      value={formData.fatherDetails.aadhaarNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      pattern="[0-9]{12}"
                      maxLength={12}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Annual Income</label>
                    <input
                      type="text"
                      name="fatherDetails.annualIncome"
                      value={formData.fatherDetails.annualIncome}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      placeholder="Annual income in Rs."
                    />
                  </div>
                </div>
              </div>

              {/* Mother's Details */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Mother's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <input
                      type="text"
                      name="motherDetails.name"
                      value={formData.motherDetails.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Qualification</label>
                    <input
                      type="text"
                      name="motherDetails.qualification"
                      value={formData.motherDetails.qualification}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Occupation</label>
                    <input
                      type="text"
                      name="motherDetails.occupation"
                      value={formData.motherDetails.occupation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      name="motherDetails.email"
                      value={formData.motherDetails.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                    <input
                      type="text"
                      name="motherDetails.aadhaarNumber"
                      value={formData.motherDetails.aadhaarNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      pattern="[0-9]{12}"
                      maxLength={12}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Annual Income</label>
                    <input
                      type="text"
                      name="motherDetails.annualIncome"
                      value={formData.motherDetails.annualIncome}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      placeholder="Annual income in Rs."
                    />
                  </div>
                </div>
              </div>

              {/* Guardian's Details */}
              <div>
                <h4 className="text-md font-medium mb-2">Guardian's Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <input
                      type="text"
                      name="guardianDetails.name"
                      value={formData.guardianDetails.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <textarea
                      name="guardianDetails.address"
                      value={formData.guardianDetails.address}
                      onChange={handleChange}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Mobile</label>
                    <input
                      type="tel"
                      name="guardianDetails.mobile"
                      value={formData.guardianDetails.mobile}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      name="guardianDetails.email"
                      value={formData.guardianDetails.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                    <input
                      type="text"
                      name="guardianDetails.aadhaarNumber"
                      value={formData.guardianDetails.aadhaarNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      pattern="[0-9]{12}"
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Occupation</label>
                    <input
                      type="text"
                      name="guardianDetails.occupation"
                      value={formData.guardianDetails.occupation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Annual Income</label>
                    <input
                      type="text"
                      name="guardianDetails.annualIncome"
                      value={formData.guardianDetails.annualIncome}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      placeholder="Annual income in Rs."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Academic Information</h3>
              
              {/* Admit Session */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Admit Session</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Group</label>
                    <input
                      type="text"
                      name="admitSession.group"
                      value={formData.admitSession.group}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Stream</label>
                    <select
                      name="admitSession.stream"
                      value={formData.admitSession.stream}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="">Select Stream</option>
                      {STREAMS.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Class</label>
                    <select
                      name="admitSession.class"
                      value={formData.admitSession.class}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    >
                      <option value="">Select Class</option>
                      {AVAILABLE_CLASSES.map(className => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Section</label>
                    <select
                      name="admitSession.section"
                      value={formData.admitSession.section}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    >
                      <option value="">Select Section</option>
                      {SECTIONS.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Roll No.</label>
                    <input
                      type="text"
                      name="admitSession.rollNo"
                      value={formData.admitSession.rollNo}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Semester</label>
                    <select
                      name="admitSession.semester"
                      value={formData.admitSession.semester}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="">Select Semester</option>
                      {SEMESTERS.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fee Group</label>
                    <input
                      type="text"
                      name="admitSession.feeGroup"
                      value={formData.admitSession.feeGroup}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">House</label>
                    <input
                      type="text"
                      name="admitSession.house"
                      value={formData.admitSession.house}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Current Session */}
              <div>
                <h4 className="text-md font-medium mb-2">Current Session</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Group</label>
                    <input
                      type="text"
                      name="currentSession.group"
                      value={formData.currentSession.group}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Stream</label>
                    <select
                      name="currentSession.stream"
                      value={formData.currentSession.stream}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="">Select Stream</option>
                      {STREAMS.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Class</label>
                    <select
                      name="currentSession.class"
                      value={formData.currentSession.class}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    >
                      <option value="">Select Class</option>
                      {AVAILABLE_CLASSES.map(className => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Section</label>
                    <select
                      name="currentSession.section"
                      value={formData.currentSession.section}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                      required
                    >
                      <option value="">Select Section</option>
                      {SECTIONS.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Roll No.</label>
                    <input
                      type="text"
                      name="currentSession.rollNo"
                      value={formData.currentSession.rollNo}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Semester</label>
                    <select
                      name="currentSession.semester"
                      value={formData.currentSession.semester}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="">Select Semester</option>
                      {SEMESTERS.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fee Group</label>
                    <input
                      type="text"
                      name="currentSession.feeGroup"
                      value={formData.currentSession.feeGroup}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">House</label>
                    <input
                      type="text"
                      name="currentSession.house"
                      value={formData.currentSession.house}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Previous Education */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Previous Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Previous School</label>
                  <input
                    type="text"
                    name="previousEducation.school"
                    value={formData.previousEducation.school}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">School Address</label>
                  <textarea
                    name="previousEducation.schoolAddress"
                    value={formData.previousEducation.schoolAddress}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">TC Date</label>
                  <input
                    type="date"
                    name="previousEducation.tcDate"
                    value={formData.previousEducation.tcDate || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Previous Class</label>
                  <input
                    type="text"
                    name="previousEducation.previousClass"
                    value={formData.previousEducation.previousClass}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Percentage/CGPA</label>
                  <input
                    type="text"
                    name="previousEducation.percentage"
                    value={formData.previousEducation.percentage}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Attendance</label>
                  <input
                    type="text"
                    name="previousEducation.attendance"
                    value={formData.previousEducation.attendance}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Extra Activities</label>
                  <textarea
                    name="previousEducation.extraActivities"
                    value={formData.previousEducation.extraActivities}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
            </section>

            {/* Transport Details */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Transport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Transport Mode</label>
                  <select
                    name="transportMode"
                    value={formData.transportMode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="">Select Transport Mode</option>
                    {TRANSPORT_MODES.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Document Information */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Document Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Student Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Student Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.studentImage ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.studentImage}
                          alt="Student"
                          className="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Image</span>
                            <input
                              type="file"
                              name="documents.studentImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Image</span>
                            <input
                              type="file"
                              name="documents.studentImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Father Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Father's Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.fatherImage ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.fatherImage}
                          alt="Father"
                          className="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Image</span>
                            <input
                              type="file"
                              name="documents.fatherImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Image</span>
                            <input
                              type="file"
                              name="documents.fatherImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mother Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mother's Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.motherImage ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.motherImage}
                          alt="Mother"
                          className="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Image</span>
                            <input
                              type="file"
                              name="documents.motherImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Image</span>
                            <input
                              type="file"
                              name="documents.motherImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guardian Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Guardian's Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.guardianImage ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.guardianImage}
                          alt="Guardian"
                          className="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Image</span>
                            <input
                              type="file"
                              name="documents.guardianImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Image</span>
                            <input
                              type="file"
                              name="documents.guardianImage"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Student's Signature</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.studentSignature ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.studentSignature}
                          alt="Student Signature"
                          className="mx-auto h-32 w-32 object-contain rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Signature</span>
                            <input
                              type="file"
                              name="documents.studentSignature"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Signature</span>
                            <input
                              type="file"
                              name="documents.studentSignature"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Parent's Signature</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.parentSignature ? (
                      <div className="space-y-1 text-center">
                        <img
                          src={formData.documents.parentSignature}
                          alt="Parent Signature"
                          className="mx-auto h-32 w-32 object-contain rounded-md"
                        />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Signature</span>
                            <input
                              type="file"
                              name="documents.parentSignature"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Signature</span>
                            <input
                              type="file"
                              name="documents.parentSignature"
                              onChange={handleChange}
                              className="sr-only"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Birth Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Birth Certificate</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.birthCertificate ? (
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Document</span>
                            <input
                              type="file"
                              name="documents.birthCertificate"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Document</span>
                            <input
                              type="file"
                              name="documents.birthCertificate"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transfer Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Transfer Certificate</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.transferCertificate ? (
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Document</span>
                            <input
                              type="file"
                              name="documents.transferCertificate"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Document</span>
                            <input
                              type="file"
                              name="documents.transferCertificate"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mark Sheet */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mark Sheet</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {formData.documents.markSheet ? (
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Change Document</span>
                            <input
                              type="file"
                              name="documents.markSheet"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload Document</span>
                            <input
                              type="file"
                              name="documents.markSheet"
                              onChange={handleChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEdit; 