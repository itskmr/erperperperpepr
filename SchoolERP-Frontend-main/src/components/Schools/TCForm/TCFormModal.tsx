import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { IssuedCertificate } from './types';
import { fetchStudentData, createCertificate, updateCertificate } from './data';
import { MultiSelectInput } from './MultipleSelectInput';

const GamesPlayed = [
  'Football',
  'Cricket',
  'Basketball',
  'Volleyball',
  'Badminton',
  'Athletics',
  'Chess',
  'Swimming',
  'Kabaddi',
];

const ExtraActivities = [
  'Participate In Stage Show',
  'Participate In Sports',
  'Participate In Debate',
  'Participate In Quiz',
  'Participate In Painting',
  'Participate In Singing',
  'Participate In Dancing',
  'Participate In Other',
];

interface TCFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  certificate: IssuedCertificate | null;
  setIssuedCertificates: React.Dispatch<React.SetStateAction<IssuedCertificate[]>>;
}

// Utility function to format ISO date string to YYYY-MM-DD for HTML date inputs
const formatDateForInput = (isoDateString: string): string => {
  if (!isoDateString) return new Date().toISOString().split('T')[0];
  try {
    const date = new Date(isoDateString);
    return date.toISOString().split('T')[0];
  } catch {
    console.warn(`[WARN] Invalid date format: ${isoDateString}, using current date`);
    return new Date().toISOString().split('T')[0];
  }
};

// Helper function to get school ID from user data stored in localStorage
const getSchoolIdFromUserData = (): { schoolId: number | null; error: string | null } => {
  try {
    // Try different localStorage keys where user data might be stored
    const userDataSources = ['userData', 'user'];
    
    for (const source of userDataSources) {
      const userDataStr = localStorage.getItem(source);
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          console.log(`[DEBUG] Found user data in ${source}:`, userData);
          
          // School users have their ID directly
          if (userData.id && typeof userData.id === 'number') {
            return { schoolId: userData.id, error: null };
          }
          
          // Check if there's a schoolId property
          if (userData.schoolId && typeof userData.schoolId === 'number') {
            return { schoolId: userData.schoolId, error: null };
          }
        } catch (parseError) {
          console.warn(`[WARN] Failed to parse user data from ${source}:`, parseError);
        }
      }
    }
    
    return { schoolId: null, error: 'School information not found in user data. Please log in again.' };
  } catch (error) {
    console.error('[ERROR] Error retrieving school ID:', error);
    return { schoolId: null, error: 'Failed to retrieve school information. Please log in again.' };
  }
};

// Helper function to validate authentication tokens
const validateAuthentication = (): { isValid: boolean; token: string | null; error: string | null } => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    return { 
      isValid: false, 
      token: null, 
      error: 'Authentication token not found. Please log in again.' 
    };
  }
  
  try {
    // Basic token validation - check if it's not empty and has parts
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return { 
        isValid: false, 
        token: null, 
        error: 'Invalid token format. Please log in again.' 
      };
    }
    
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(tokenParts[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      // Clear expired token
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      return { 
        isValid: false, 
        token: null, 
        error: 'Session expired. Please log in again.' 
      };
    }
    
    return { isValid: true, token, error: null };
  } catch (error) {
    console.warn('[WARN] Token validation failed:', error);
    // If validation fails, assume token is valid but warn user
    return { isValid: true, token, error: null };
  }
};

const TCFormModal: React.FC<TCFormModalProps> = ({
  isOpen,
  onClose,
  isEdit,
  certificate,
  setIssuedCertificates
}) => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IssuedCertificate>({
    status: '',
    studentId: '',
    schoolId: 0,
    fullName: '',
    feesPaidUpTo: '',
    feesConcessionAvailed: '',
    certificateId: '',
    leavingDate: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    section: '',
    currentClass: '',
    academicYear: '',
    feesUpToDate: '',
    lastExam: '',
    subjectStudied: '',
    conduct: '',
    remark: '',
    behavior: '',
    studentName: '',
    studentClass: '',
    admissionNumber: '',
    motherName: '',
    fatherName: '',
    nationality: '',
    category: '',
    dateOfBirth: '',
    issueDate: new Date().toISOString().split('T')[0],
    reason: '',
    examIn: '',
    qualified: '',
    gamesPlayed: [],
    extraActivity: [],
    tcNo: '',
    subject: '',
    generalConduct: '',
    dateOfLeaving: new Date().toISOString().split('T')[0],
    remarks: '',
    maxAttendance: '',
    obtainedAttendance: '',
    lastAttendanceDate: new Date().toISOString().split('T')[0],
    whetherFailed: '',
    tcCharge: '',
    toClass: '',
    classInWords: '',
    behaviorRemarks: '',
    rollNo: '',
    admitClass: '',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    schoolDetails: {
      schoolName: '',
      address: '',
      recognitionId: '',
      affiliationNo: '',
      contact: '',
      email: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isEdit && certificate) {
      setFormData(certificate);
      setAdmissionNumber(certificate.admissionNumber);
    } else {
      resetForm();
    }
  }, [isEdit, certificate]);

  const resetForm = () => {
    setFormData({
      status: '',
      studentId: '',
      schoolId: 0,
      fullName: '',
      feesPaidUpTo: '',
      feesConcessionAvailed: '',
      certificateId: '',
      leavingDate: '',
      dateOfIssue: new Date().toISOString().split('T')[0],
      section: '',
      currentClass: '',
      academicYear: '',
      feesUpToDate: '',
      lastExam: '',
      subjectStudied: '',
      conduct: '',
      remark: '',
      behavior: '',
      studentName: '',
      studentClass: '',
      admissionNumber: '',
      motherName: '',
      fatherName: '',
      nationality: '',
      category: '',
      dateOfBirth: '',
      issueDate: new Date().toISOString().split('T')[0],
      reason: '',
      examIn: '',
      qualified: '',
      gamesPlayed: [],
      extraActivity: [],
      tcNo: '',
      subject: '',
      generalConduct: '',
      dateOfLeaving: new Date().toISOString().split('T')[0],
      remarks: '',
      maxAttendance: '',
      obtainedAttendance: '',
      lastAttendanceDate: new Date().toISOString().split('T')[0],
      whetherFailed: '',
      tcCharge: '',
      toClass: '',
      classInWords: '',
      behaviorRemarks: '',
      rollNo: '',
      admitClass: '',
      dateOfAdmission: new Date().toISOString().split('T')[0],
      schoolDetails: {
        schoolName: '',
        address: '',
        recognitionId: '',
        affiliationNo: '',
        contact: '',
        email: '',
        imageUrl: '',
      },
    });
    setAdmissionNumber('');
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[DEBUG] Processing admission number: "${admissionNumber}"`);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DEBUG] Fetching student data for admission number: "${admissionNumber}"`);
      const student = await fetchStudentData(admissionNumber);
      console.log('[DEBUG] Student data retrieved successfully:', student);
      
      setFormData((prev) => ({
        ...prev,
        admissionNumber: student.admissionNumber,
        studentName: student.fullName,
        studentClass: student.currentClass,
        motherName: student.motherName || prev.motherName,
        fatherName: student.fatherName || prev.fatherName,
        nationality: student.nationality || prev.nationality,
        category: student.category || prev.category,
        dateOfBirth: formatDateForInput(student.dateOfBirth) || prev.dateOfBirth,
        subject: student.subjectStudied || prev.subject,
        generalConduct: student.conduct || prev.generalConduct,
        remarks: student.remarks || prev.remarks,
        dateOfLeaving: formatDateForInput(student.dateOfLeaving) || prev.dateOfLeaving,
        dateOfIssue: formatDateForInput(student.dateOfIssue) || prev.dateOfIssue,
        admitClass: student.admitClass || prev.admitClass,
        feesPaidUpTo: formatDateForInput(student.feesUpToDate) || prev.feesPaidUpTo,
        lastAttendanceDate: formatDateForInput(student.lastAttendanceDate) || prev.lastAttendanceDate,
        dateOfAdmission: formatDateForInput(student.dateOfAdmission) || prev.dateOfAdmission,
        rollNo: student.rollNo || prev.rollNo,
        gamesPlayed: student.gamesPlayed ? 
          (Array.isArray(student.gamesPlayed as string[] | string) ? 
            student.gamesPlayed as string[] : 
            (typeof student.gamesPlayed === 'string' ? (student.gamesPlayed as string).split(',').map((g: string) => g.trim()) : [])
          ) : [],
        extraActivity: student.extraActivity ? 
          (Array.isArray(student.extraActivity as string[] | string) ?
            student.extraActivity as string[] :
            (typeof student.extraActivity === 'string' ? (student.extraActivity as string).split(',').map((a: string) => a.trim()) : [])
          ) : [],
        schoolDetails: student.schoolDetails ? {
          ...prev.schoolDetails, 
          ...student.schoolDetails 
        } : prev.schoolDetails
      }));
    } catch (err) {
      console.error('[ERROR] Failed to fetch student data:', err);
      
      // More detailed error message
      if (err instanceof Error) {
        setError(`Student not found: ${err.message}. Please check the admission number.`);
      } else {
        setError('Student not found. Please check the admission number.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields with proper fallback values
    const requiredFields = [
      { field: 'tcNo', value: formData.tcNo, label: 'TC Number' },
      { field: 'studentName', value: formData.studentName, label: 'Student Name' },
      { field: 'admissionNumber', value: formData.admissionNumber, label: 'Admission Number' },
      { field: 'fatherName', value: formData.fatherName, label: "Father's Name" },
      { field: 'motherName', value: formData.motherName, label: "Mother's Name" },
      { field: 'dateOfBirth', value: formData.dateOfBirth, label: 'Date of Birth' },
      { field: 'studentClass', value: formData.studentClass, label: 'Current Class' },
      { field: 'dateOfLeaving', value: formData.dateOfLeaving, label: 'Date of Leaving' },
    ];
    
    const missingFields = requiredFields.filter(({ value }) => !value || value.trim() === '');
    
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label);
      toast.error(`Please fill in all required fields: ${missingLabels.join(', ')}`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate authentication
      const authValidation = validateAuthentication();
      if (!authValidation.isValid) {
        toast.error(authValidation.error || 'Authentication failed');
        return;
      }
      
      // Get school ID
      const schoolData = getSchoolIdFromUserData();
      if (!schoolData.schoolId) {
        toast.error(schoolData.error || 'School information not found');
        return;
      }
      
      console.log(`[DEBUG] Using school ID: ${schoolData.schoolId} for ${isEdit ? 'update' : 'create'}`);
      
      // Ensure all required fields have valid values with proper defaults
      const formattedCertificate: IssuedCertificate = {
        ...formData,
        schoolId: schoolData.schoolId,
        // Ensure proper date formatting
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        dateOfAdmission: new Date(formData.dateOfAdmission).toISOString(),
        dateOfLeaving: new Date(formData.dateOfLeaving).toISOString(),
        feesPaidUpTo: new Date(formData.feesPaidUpTo || new Date()).toISOString(),
        lastAttendanceDate: new Date(formData.lastAttendanceDate || new Date()).toISOString(),
        dateOfIssue: new Date(formData.dateOfIssue || new Date()).toISOString(),
        // Ensure numeric fields are properly formatted
        maxAttendance: formData.maxAttendance || '220',
        obtainedAttendance: formData.obtainedAttendance || '200',
        tcCharge: formData.tcCharge || '0',
        // Ensure required enum fields have valid defaults
        whetherFailed: formData.whetherFailed || 'No',
        examIn: formData.examIn || 'School',
        qualified: formData.qualified || 'Yes',
        reason: formData.reason || 'ParentWill',
        generalConduct: formData.generalConduct || 'Good',
        feesConcessionAvailed: formData.feesConcessionAvailed || 'None',
        // Ensure text fields are not empty
        nationality: formData.nationality || 'Indian',
        category: formData.category || 'General',
        section: formData.section || '',
        subject: formData.subject || 'English, Hindi, Mathematics, Science, Social Studies',
        behaviorRemarks: formData.behaviorRemarks || '',
        toClass: formData.toClass || '',
        classInWords: formData.classInWords || '',
        rollNo: formData.rollNo || '',
        // Ensure arrays are properly set
        gamesPlayed: formData.gamesPlayed || [],
        extraActivity: formData.extraActivity || [],
      };
      
      let result: IssuedCertificate;
      if (isEdit) {
        console.log(`[DEBUG] Updating certificate for admission number: ${admissionNumber}`);
        result = await updateCertificate(formattedCertificate);
        setIssuedCertificates((prev) =>
          prev.map((cert) => (cert.admissionNumber === admissionNumber ? result : cert))
        );
        toast.success('Certificate updated successfully!');
      } else {
        console.log(`[DEBUG] Creating new certificate for admission number: ${formData.admissionNumber}`);
        result = await createCertificate(formattedCertificate);
        setIssuedCertificates((prev) => [result, ...prev]);
        toast.success('Certificate created successfully!');
      }
      
      onClose();
    } catch (error) {
      console.error(`[ERROR] ${isEdit ? 'Update' : 'Create'} operation failed:`, error);
      
      let errorMessage = 'Operation failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (error.message.includes('Authentication')) {
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          errorMessage = 'Session expired. Please log in again and try.';
        } else if (error.message.includes('School information')) {
          errorMessage = 'School information not found. Please log in again.';
        } else if (error.message.includes('Student not found')) {
          errorMessage = 'Student not found. Please check the admission number.';
        }
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-7xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Transfer Certificate' : 'Generate Transfer Certificate'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Number
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Enter admission number"
                readOnly={isEdit}
                required
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleAdmissionSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              )}
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.studentName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            
            {/* Date Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={formatDateForInput(formData.dateOfBirth)}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Admission</label>
              <input
                type="date"
                value={formatDateForInput(formData.dateOfAdmission)}
                onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Attendance Date</label>
              <input
                type="date"
                value={formatDateForInput(formData.lastAttendanceDate)}
                onChange={(e) => setFormData({ ...formData, lastAttendanceDate: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Academic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Admit Class</label>
              <input
                type="text"
                value={formData.admitClass}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Class</label>
              <input
                type="text"
                value={formData.studentClass}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text"
                value={formData.rollNo}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>

            {/* Financial Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fees Paid Up To</label>
              <input
                type="date"
                value={formatDateForInput(formData.feesPaidUpTo)}
                onChange={(e) => setFormData({ ...formData, feesPaidUpTo: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Academic Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Attendance</label>
              <input
                type="text"
                value={formData.maxAttendance}
                onChange={(e) => setFormData({ ...formData, maxAttendance: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Obtained Attendance</label>
              <input
                type="text"
                value={formData.obtainedAttendance}
                onChange={(e) => setFormData({ ...formData, obtainedAttendance: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Whether Failed</label>
              <select
                value={formData.whetherFailed}
                onChange={(e) => setFormData({ ...formData, whetherFailed: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="NA">N/A</option>
                <option value="CBSEBoard">CBSE Board</option>
              </select>
            </div>

            {/* Continue with other form fields... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Appeared In</label>
              <select
                value={formData.examIn}
                onChange={(e) => setFormData({ ...formData, examIn: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="School">School</option>
                <option value="Board">Board</option>
                <option value="NA">N/A</option>
                <option value="CBSEBoard">CBSE Board</option>
                <option value="SchoolFailed">School Failed</option>
                <option value="SchoolPassed">School Passed</option>
                <option value="SchoolCompartment">School Compartment</option>
                <option value="BoardPassed">Board Passed</option>
                <option value="BoardFailed">Board Failed</option>
                <option value="BoardCompartment">Board Compartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualified for Promotion</label>
              <select
                value={formData.qualified}
                onChange={(e) => setFormData({ ...formData, qualified: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="NA">N/A</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Compartment">Compartment</option>
                <option value="AsperCBSEBoardResult">As per CBSE Board Result</option>
                <option value="AppearedinclassXExam">Appeared in class X Exam</option>
                <option value="AppearedinclassXIIExam">Appeared in class XII Exam</option>
              </select>
            </div>

            {/* Transfer Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">To Class</label>
              <input
                type="text"
                value={formData.toClass}
                onChange={(e) => setFormData({ ...formData, toClass: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class in Words</label>
              <input
                type="text"
                value={formData.classInWords}
                onChange={(e) => setFormData({ ...formData, classInWords: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Existing Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">TC Number</label>
              <input
                type="text"
                value={formData.tcNo}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TC Charge</label>
              <input
                type="text"
                value={formData.tcCharge}
                onChange={(e) => setFormData({ ...formData, tcCharge: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
              <input
                type="date"
                value={formatDateForInput(formData.dateOfIssue)}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Leaving</label>
              <input
                type="date"
                value={formatDateForInput(formData.dateOfLeaving)}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee Concession</label>
              <select
                value={formData.feesConcessionAvailed}
                onChange={(e) => setFormData({ ...formData, feesConcessionAvailed: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="None">None</option>
                <option value="Partial">Partial</option>
                <option value="Full">Full</option>
              </select>
            </div>
            {/* Behavior and Conduct */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Conduct Remark</label>
              <input
                value={formData.behaviorRemarks}
                onChange={(e) => setFormData({ ...formData, behaviorRemarks: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter conduct remarks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remark</label>
              <select
                value={formData.generalConduct}
                onChange={(e) => setFormData({ ...formData, generalConduct: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="NeedsImprovement">Needs Improvement</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subjects Studied</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter subjects (comma separated)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Games Played */}
            <MultiSelectInput
              label="Games Played"
              options={Object.values(GamesPlayed)}
              selectedValues={formData.gamesPlayed}
              onChange={(selectedValues) =>
                setFormData({ ...formData, gamesPlayed: selectedValues })
              }
            />

            {/* Extra Activities */}
            <MultiSelectInput
              label="Extra Activities"
              options={Object.values(ExtraActivities)}
              selectedValues={formData.extraActivity}
              onChange={(selectedValues) =>
                setFormData({ ...formData, extraActivity: selectedValues })
              }
            />
          </div>

            {/* Transfer Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="FamilyRelocation">Family Relocation</option>
                <option value="AdmissionInOtherSchool">Admission in Other School</option>
                <option value="Duetolongabsencewithoutinformation">Due to long absence without information</option>
                <option value="FatherJobTransfer">Father Job Transfer</option>
                <option value="GetAdmissioninHigherClass">Get Admission in Higher Class</option>
                <option value="GoingtoNativePlace">Going to Native Place</option>
                <option value="ParentWill">Parent Will</option>
                <option value="Passedoutfromtheschool">Passed out from the school</option>
                <option value="Shiftingtootherplace">Shifting to other place</option>
                <option value="TransferCase">Transfer Case</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEdit ? 'Update Certificate' : 'Generate Certificate'}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TCFormModal;