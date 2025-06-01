import { IssuedCertificate, StudentDetails } from './types';

// Add interfaces for API responses
interface TCAPIResponse {
  id: string;
  schoolId: number;
  fullName: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  category: string;
  dateOfBirth: string;
  admissionNo: string;
  currentClass?: string;
  admitClass?: string;
  section?: string;
  rollNo?: string;
  dateOfAdmission?: string;
  sessionInfo?: {
    currentClass?: string;
    admitClass?: string;
    currentSection?: string;
    admitSection?: string;
    currentRollNo?: string;
    admitRollNo?: string;
    admitDate?: string;
  };
  schoolDetails?: {
    schoolName: string;
    address: string;
    recognitionId: string;
    affiliationNo: string;
    contact: string;
    email: string;
    imageUrl: string;
  };
  gamesPlayed?: string | string[];
  extraActivity?: string | string[];
  academicYear?: string;
  lastAttendanceDate?: string;
  feesPaidUpTo?: string;
  maxAttendance?: string;
  obtainedAttendance?: string;
  subject?: string;
  whetherFailed?: string;
  examIn?: string;
  qualified?: string;
  generalConduct?: string;
  dateOfLeaving?: string;
  behavior?: string;
  reason?: string;
  tcCharge?: string;
  toClass?: string;
  classInWords?: string;
  conduct?: string;
  remark?: string;
  behaviorRemarks?: string;
  subjectStudied?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Get current school ID from API login or localStorage
const getSchoolId = async (email?: string, password?: string): Promise<number> => {
  // If no credentials provided, try to get from localStorage
  if (!email || !password) {
    try {
      // Try different localStorage keys where user data might be stored
      const userDataSources = ['userData', 'user'];
      
      for (const source of userDataSources) {
        const userDataStr = localStorage.getItem(source);
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            console.log(`[DEBUG] Found user data in ${source} for school ID:`, userData);
            
            // School users have their ID directly
            if (userData.id && typeof userData.id === 'number') {
              return userData.id;
            }
            
            // Check if there's a schoolId property
            if (userData.schoolId && typeof userData.schoolId === 'number') {
              return userData.schoolId;
            }
          } catch (parseError) {
            console.warn(`[WARN] Failed to parse user data from ${source}:`, parseError);
          }
        }
      }
      
      console.warn('[WARN] No valid school ID found in localStorage, using default');
      return 1; // Default fallback
    } catch (error) {
      console.error('[ERROR] Error retrieving school ID from localStorage:', error);
      return 1; // Default fallback
    }
  }

  try {
    const response = await fetch('http://localhost:5000/api/schoolLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store the token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user)); // Use consistent key
      return data.data.user.id;
    } else {
      console.error('School login failed:', data.message || 'Unknown error');
      return 1; // Default to 1 if login fails
    }
  } catch (error) {
    console.error('Error during school login:', error);
    return 1; // Default to 1 if there's an error
  }
};

export const fetchStudentData = async (admissionNumber: string): Promise<StudentDetails> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Try the TC-specific endpoint first
    const tcEndpoint = `${API_BASE_URL}/students/details/${admissionNumber}`;
    console.log(`[DEBUG] Fetching student data from: ${tcEndpoint}`);
    
    try {
      console.log(`[DEBUG] Attempting to fetch student with admission number: "${admissionNumber}" via TC endpoint`);
      const response = await fetch(tcEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[DEBUG] TC endpoint error: ${response.status} ${response.statusText}`, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Student not found (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[DEBUG] Student data fetched successfully via TC endpoint:', result);
      
      // Extract the data from the response object
      const data = result.success ? result.data : result;
      
      // Format and return the data
      return formatStudentData(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`[DEBUG] Failed to fetch via TC endpoint: ${error.message}`);
      }
      
      // Try the student-specific endpoint
      const studentLookupEndpoint = `${API_BASE_URL}/students/lookup/${admissionNumber}`;
      console.log(`[DEBUG] Trying student lookup endpoint: ${studentLookupEndpoint}`);
      
      try {
        const lookupResponse = await fetch(studentLookupEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!lookupResponse.ok) {
          console.log(`[DEBUG] Student lookup failed: ${lookupResponse.status}`);
          // Continue to the next endpoint
        } else {
          const studentBasicInfo = await lookupResponse.json();
          console.log(`[DEBUG] Student basic info found:`, studentBasicInfo);
          
          // If we have the student ID, fetch full details
          if (studentBasicInfo.id) {
            const studentDetailEndpoint = `${API_BASE_URL}/students/${studentBasicInfo.id}`;
            console.log(`[DEBUG] Fetching student details: ${studentDetailEndpoint}`);
            
            const detailResponse = await fetch(studentDetailEndpoint, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (detailResponse.ok) {
              const studentDetails = await detailResponse.json();
              console.log(`[DEBUG] Student details fetched:`, studentDetails);
              return formatStudentDetailsFromStudentAPI(studentDetails);
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`[DEBUG] Error in student lookup: ${error.message}`);
        }
      }
      
      // If that also fails, try the regular students endpoint
      const studentEndpoint = `${API_BASE_URL}/students/admission/${admissionNumber}`;
      console.log(`[DEBUG] Trying regular students endpoint: ${studentEndpoint}`);
      
      const response = await fetch(studentEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[DEBUG] Students endpoint error: ${response.status}`, errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Student not found. Please check the admission number. (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success || !result.data) {
        console.log(`[DEBUG] Invalid response format:`, result);
        throw new Error('Invalid response format or student not found');
      }
      
      const student = result.data;
      console.log('[DEBUG] Student data fetched successfully via students endpoint:', student);
      
      // Format student data from the student API format
      return formatStudentDetailsFromStudentAPI(student);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[ERROR] Error fetching student data:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred while fetching student data');
  }
};

// Helper function to format student data from the TC API format
const formatStudentData = (data: TCAPIResponse): StudentDetails => {
  console.log(`[DEBUG] Formatting student data:`, data);
  
  // The API response has class information directly on the object
  let classInfo = data.currentClass || data.admitClass || '';
  console.log(`[DEBUG] Original class from TC API: "${classInfo}"`);
  
  // Handle Nursery class formatting
  if (classInfo.toLowerCase().includes('nur')) {
    console.log(`[DEBUG] Nursery class detected: "${classInfo}"`);
    classInfo = 'Nursery';
  } 
  // Handle numeric class formatting (adding "Class" prefix if it's just a number)
  else if (/^[0-9]+$/.test(classInfo)) {
    console.log(`[DEBUG] Numeric class detected: "${classInfo}"`);
    classInfo = `Class ${classInfo}`;
  }
  
  console.log(`[DEBUG] Formatted class: "${classInfo}"`);

  // Format games played and extra activities to handle different input formats
  let gamesPlayed = data.gamesPlayed || [];
  if (typeof gamesPlayed === 'string') {
    gamesPlayed = gamesPlayed.split(',').map((game: string) => game.trim());
  }
  
  let extraActivity = data.extraActivity || [];
  if (typeof extraActivity === 'string') {
    extraActivity = extraActivity.split(',').map((activity: string) => activity.trim());
  }
  
  console.log(`[DEBUG] Formatted games:`, gamesPlayed);
  console.log(`[DEBUG] Formatted activities:`, extraActivity);

  // Get roll number - it's directly on the object
  const rollNo = data.rollNo || data.section || '';
  console.log(`[DEBUG] Roll number from data: "${rollNo}"`);

  return {
    studentId: data.id,
    schoolId: data.schoolId,
    fullName: data.fullName || '',
    fatherName: data.fatherName || '',
    motherName: data.motherName || '',
    nationality: data.nationality || 'Indian',
    category: data.category || 'General',
    dateOfBirth: data.dateOfBirth,
    dateOfAdmission: data.dateOfAdmission || new Date().toISOString(),
    section: data.section || '',
    admissionNumber: data.admissionNo,
    currentClass: data.currentClass || classInfo,
    admitClass: data.admitClass || classInfo,
    academicYear: data.academicYear || new Date().getFullYear().toString(),
    rollNo: rollNo,
    lastAttendanceDate: data.lastAttendanceDate || new Date().toISOString(),
    feesUpToDate: data.feesPaidUpTo || new Date().toISOString(),
    maxAttendance: data.maxAttendance || '220',
    obtainedAttendance: data.obtainedAttendance || '200',
    subject: data.subject || 'English, Hindi, Mathematics, Science, Social Studies',
    whetherFailed: data.whetherFailed || 'No',
    examIn: data.examIn || 'School',
    qualified: data.qualified || 'Yes',
    generalConduct: data.generalConduct || 'Good',
    dateOfLeaving: data.dateOfLeaving || new Date().toISOString(),
    behavior: data.generalConduct || 'Good',
    reason: data.reason || 'ParentWill',
    lastExam: data.examIn || 'School',
    tcCharge: data.tcCharge || '0',
    toClass: data.toClass || '',
    classInWords: data.classInWords || '',
    conduct: data.generalConduct || 'Good',
    remark: data.behaviorRemarks || '',
    behaviorRemarks: data.behaviorRemarks || '',
    subjectStudied: data.subject || 'English, Hindi, Mathematics, Science, Social Studies',
    gamesPlayed,
    extraActivity,
    dateOfIssue: new Date().toISOString(),
    remarks: '',
    schoolDetails: typeof data.schoolDetails === 'object' && data.schoolDetails !== null ? {
      schoolName: data.schoolDetails.schoolName || '',
      address: data.schoolDetails.address || '',
      recognitionId: data.schoolDetails.recognitionId || '',
      affiliationNo: data.schoolDetails.affiliationNo || '',
      contact: data.schoolDetails.contact || '',
      email: data.schoolDetails.email || '',
      imageUrl: data.schoolDetails.imageUrl || ''
    } : {
      schoolName: '',
      address: '',
      recognitionId: '',
      affiliationNo: '',
      contact: '',
      email: '',
      imageUrl: ''
    }
  };
};

// Helper function to format student data from the Student API
const formatStudentDetailsFromStudentAPI = (student: TCAPIResponse): StudentDetails => {
  // Standardize class name format
  let classInfo = student.sessionInfo?.currentClass || student.sessionInfo?.admitClass || '';
  console.log(`[DEBUG] Original class from Student API: "${classInfo}"`);
  
  // Handle Nursery class formatting
  if (classInfo.toLowerCase().includes('nur')) {
    console.log(`[DEBUG] Nursery class detected: "${classInfo}"`);
    classInfo = 'Nursery';
  } 
  // Handle numeric class formatting (adding "Class" prefix if it's just a number)
  else if (/^[0-9]+$/.test(classInfo)) {
    console.log(`[DEBUG] Numeric class detected: "${classInfo}"`);
    classInfo = `Class ${classInfo}`;
  }
  
  console.log(`[DEBUG] Formatted class: "${classInfo}"`);
  
  // Get roll number from sessionInfo
  const rollNo = student.sessionInfo?.currentRollNo || student.sessionInfo?.admitRollNo || '';
  console.log(`[DEBUG] Roll number from sessionInfo: "${rollNo}"`);
  
  return {
    studentId: student.id,
    schoolId: student.schoolId,
    fullName: student.fullName,
    fatherName: student.fatherName || '',
    motherName: student.motherName || '',
    nationality: student.nationality || 'Indian',
    category: student.category || 'General',
    dateOfBirth: student.dateOfBirth,
    dateOfAdmission: student.sessionInfo?.admitDate || new Date().toISOString(),
    section: student.sessionInfo?.currentSection || student.sessionInfo?.admitSection || '',
    admissionNumber: student.admissionNo,
    currentClass: student.sessionInfo?.currentClass || classInfo,
    admitClass: student.sessionInfo?.admitClass || classInfo,
    academicYear: new Date().getFullYear().toString(),
    rollNo: rollNo,
    lastAttendanceDate: new Date().toISOString(),
    feesUpToDate: new Date().toISOString(),
    maxAttendance: '220',
    obtainedAttendance: '200',
    subject: 'English, Hindi, Mathematics, Science, Social Studies',
    whetherFailed: 'No',
    examIn: 'School',
    qualified: 'Yes',
    generalConduct: 'Good',
    dateOfLeaving: new Date().toISOString(),
    behavior: 'Good',
    reason: 'ParentWill',
    lastExam: 'School',
    tcCharge: '0',
    toClass: '',
    classInWords: '',
    conduct: 'Good',
    remark: '',
    behaviorRemarks: '',
    subjectStudied: 'English, Hindi, Mathematics, Science, Social Studies',
    gamesPlayed: ['Cricket', 'Football'],
    extraActivity: ['Dance', 'Singing'],
    dateOfIssue: new Date().toISOString(),
    remarks: '',
    schoolDetails: student.schoolDetails && typeof student.schoolDetails === 'object' ? {
      schoolName: student.schoolDetails.schoolName || '',
      address: student.schoolDetails.address || '',
      recognitionId: student.schoolDetails.recognitionId || '',
      affiliationNo: student.schoolDetails.affiliationNo || '',
      contact: student.schoolDetails.contact || '',
      email: student.schoolDetails.email || '',
      imageUrl: student.schoolDetails.imageUrl || ''
    } : {
      schoolName: '',
      address: '',
      recognitionId: '',
      affiliationNo: '',
      contact: '',
      email: '',
      imageUrl: ''
    }
  };
};

export const fetchIssuedCertificates = async (): Promise<IssuedCertificate[]> => {
  try {
    const schoolId = await getSchoolId('', '');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    // Use the tcform routes with authentication
    const response = await fetch(`${API_BASE_URL}/tcs?schoolId=${schoolId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to fetch certificates');
    }
    
    const result = await response.json();
    
    // Extract the data array from the response object
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      // In case the API returns the array directly
      return result;
    } else {
      console.warn('API response is not in expected format:', result);
      return [];
    }
  } catch (error) {
    console.error('Error fetching issued certificates:', error);
    throw error;
  }
};

export const createCertificate = async (certificate: IssuedCertificate): Promise<IssuedCertificate> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    // Map enum values from frontend display text to backend enum values
    const mapEnumValue = (frontendValue: string, enumMapping: Record<string, string>): string => {
      // Find the backend enum key that matches the frontend display value
      const backendKey = Object.keys(enumMapping).find(key => enumMapping[key] === frontendValue);
      return backendKey || frontendValue; // Return backend key or original value if not found
    };

    // Enum mappings from frontend display values to backend enum keys
    const reasonMapping = {
      'FamilyRelocation': 'Family Relocation',
      'AdmissionInOtherSchool': 'Admission in Other School', 
      'Duetolongabsencewithoutinformation': 'Due to long absence without information',
      'FatherJobTransfer': 'Father Job Transfer',
      'GetAdmissioninHigherClass': 'Get Admission in Higher Class',
      'GoingtoNativePlace': 'Going to Native Place',
      'ParentWill': 'Parent Will',
      'Passedoutfromtheschool': 'Passed out from the school',
      'Shiftingtootherplace': 'Shifting to other place',
      'TransferCase': 'Transfer Case',
      'Other': 'Other'
    };

    const examMapping = {
      'School': 'School',
      'Board': 'Board',
      'NA': 'NA',
      'CBSEBoard': 'CBSE Board',
      'SchoolFailed': 'School Failed',
      'SchoolPassed': 'School Passed',
      'SchoolCompartment': 'School Compartment',
      'BoardPassed': 'Board Passed',
      'BoardFailed': 'Board Failed',
      'BoardCompartment': 'Board Compartment'
    };

    const qualifiedMapping = {
      'Yes': 'Yes',
      'No': 'No',
      'NA': 'NA',
      'Pass': 'Pass',
      'Fail': 'Fail',
      'Compartment': 'Compartment',
      'AsperCBSEBoardResult': 'As per CBSE Board Result',
      'AppearedinclassXExam': 'Appeared in class X Exam',
      'AppearedinclassXIIExam': 'Appeared in class XII Exam'
    };

    const concessionMapping = {
      'None': 'None',
      'Partial': 'Partial',
      'Full': 'Full'
    };

    // Ensure required fields are not empty with fallback values
    const studentName = certificate.studentName || certificate.fullName || '';
    const currentClass = certificate.studentClass || certificate.currentClass || '';
    const section = certificate.section || 'A';
    const whetherFailed = certificate.whetherFailed || 'No';
    const examIn = certificate.examIn || 'School';
    const qualified = certificate.qualified || 'Yes';
    const reason = certificate.reason || 'ParentWill';
    const generalConduct = certificate.generalConduct || 'Good';
    const feeConcession = certificate.feesConcessionAvailed || 'None';

    console.log(`[DEBUG] Mapping form data for student: ${studentName}, class: ${currentClass}`);

    // Map frontend model to backend model with proper field mapping
    const tcData = {
      // Basic required fields
      fullName: studentName,
      admissionNumber: certificate.admissionNumber,
      fatherName: certificate.fatherName || '',
      motherName: certificate.motherName || '',
      dateOfBirth: certificate.dateOfBirth,
      nationality: certificate.nationality || 'Indian',
      category: certificate.category || 'General',
      dateOfAdmission: certificate.dateOfAdmission,
      currentClass: currentClass,
      whetherFailed: whetherFailed,
      section: section,
      rollNumber: certificate.rollNo || '',
      examAppearedIn: mapEnumValue(examIn, examMapping),
      qualifiedForPromotion: mapEnumValue(qualified, qualifiedMapping),
      reasonForLeaving: mapEnumValue(reason, reasonMapping),
      dateOfLeaving: certificate.dateOfLeaving,
      lastAttendanceDate: certificate.lastAttendanceDate,
      toClass: certificate.toClass || '',
      classInWords: certificate.classInWords || '',
      maxAttendance: parseInt(certificate.maxAttendance) || 220,
      obtainedAttendance: parseInt(certificate.obtainedAttendance) || 200,
      subjectsStudied: certificate.subject || 'English, Hindi, Mathematics, Science, Social Studies',
      generalConduct: generalConduct,
      behaviorRemarks: certificate.behaviorRemarks || '',
      feesPaidUpTo: certificate.feesPaidUpTo || certificate.feesUpToDate,
      tcCharge: parseFloat(certificate.tcCharge) || 0,
      feeConcession: mapEnumValue(feeConcession, concessionMapping),
      gamesPlayed: certificate.gamesPlayed || [],
      extraActivities: certificate.extraActivity || [],
      tcNumber: certificate.tcNo || '',
      issuedDate: certificate.dateOfIssue || new Date().toISOString()
    };

    console.log('[DEBUG] Mapped TC data for backend:', tcData);

    const response = await fetch(`${API_BASE_URL}/tcs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tcData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json();
      console.error('[ERROR] TC Creation failed:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to create certificate');
    }
    
    const result = await response.json();
    console.log('[DEBUG] TC Creation successful:', result);
    return result.data || result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating certificate:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred while creating certificate');
  }
};

export const deleteCertificate = async (admissionNumber: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    // Find the TC ID by admission number
    const tcId = await getTcIdFromAdmissionNumber(admissionNumber);
    
    const response = await fetch(`${API_BASE_URL}/tcs/${tcId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete certificate');
    }
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};

export const updateCertificate = async (certificate: IssuedCertificate): Promise<IssuedCertificate> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    // Map enum values from frontend display text to backend enum values
    const mapEnumValue = (frontendValue: string, enumMapping: Record<string, string>): string => {
      // Find the backend enum key that matches the frontend display value
      const backendKey = Object.keys(enumMapping).find(key => enumMapping[key] === frontendValue);
      return backendKey || frontendValue; // Return backend key or original value if not found
    };

    // Enum mappings from frontend display values to backend enum keys
    const reasonMapping = {
      'FamilyRelocation': 'Family Relocation',
      'AdmissionInOtherSchool': 'Admission in Other School', 
      'Duetolongabsencewithoutinformation': 'Due to long absence without information',
      'FatherJobTransfer': 'Father Job Transfer',
      'GetAdmissioninHigherClass': 'Get Admission in Higher Class',
      'GoingtoNativePlace': 'Going to Native Place',
      'ParentWill': 'Parent Will',
      'Passedoutfromtheschool': 'Passed out from the school',
      'Shiftingtootherplace': 'Shifting to other place',
      'TransferCase': 'Transfer Case',
      'Other': 'Other'
    };

    const examMapping = {
      'School': 'School',
      'Board': 'Board',
      'NA': 'NA',
      'CBSEBoard': 'CBSE Board',
      'SchoolFailed': 'School Failed',
      'SchoolPassed': 'School Passed',
      'SchoolCompartment': 'School Compartment',
      'BoardPassed': 'Board Passed',
      'BoardFailed': 'Board Failed',
      'BoardCompartment': 'Board Compartment'
    };

    const qualifiedMapping = {
      'Yes': 'Yes',
      'No': 'No',
      'NA': 'NA',
      'Pass': 'Pass',
      'Fail': 'Fail',
      'Compartment': 'Compartment',
      'AsperCBSEBoardResult': 'As per CBSE Board Result',
      'AppearedinclassXExam': 'Appeared in class X Exam',
      'AppearedinclassXIIExam': 'Appeared in class XII Exam'
    };

    const concessionMapping = {
      'None': 'None',
      'Partial': 'Partial',
      'Full': 'Full'
    };

    // Ensure required fields are not empty with fallback values
    const studentName = certificate.studentName || certificate.fullName || '';
    const currentClass = certificate.studentClass || certificate.currentClass || '';
    const section = certificate.section || 'A';
    const whetherFailed = certificate.whetherFailed || 'No';
    const examIn = certificate.examIn || 'School';
    const qualified = certificate.qualified || 'Yes';
    const reason = certificate.reason || 'ParentWill';
    const generalConduct = certificate.generalConduct || 'Good';
    const feeConcession = certificate.feesConcessionAvailed || 'None';

    console.log(`[DEBUG] Updating TC for student: ${studentName}, class: ${currentClass}`);

    // Map frontend model to backend model with proper field mapping
    const tcData = {
      // Basic required fields
      fullName: studentName,
      admissionNumber: certificate.admissionNumber,
      fatherName: certificate.fatherName || '',
      motherName: certificate.motherName || '',
      dateOfBirth: certificate.dateOfBirth,
      nationality: certificate.nationality || 'Indian',
      category: certificate.category || 'General',
      dateOfAdmission: certificate.dateOfAdmission,
      currentClass: currentClass,
      whetherFailed: whetherFailed,
      section: section,
      rollNumber: certificate.rollNo || '',
      examAppearedIn: mapEnumValue(examIn, examMapping),
      qualifiedForPromotion: mapEnumValue(qualified, qualifiedMapping),
      reasonForLeaving: mapEnumValue(reason, reasonMapping),
      dateOfLeaving: certificate.dateOfLeaving,
      lastAttendanceDate: certificate.lastAttendanceDate,
      toClass: certificate.toClass || '',
      classInWords: certificate.classInWords || '',
      maxAttendance: parseInt(certificate.maxAttendance) || 220,
      obtainedAttendance: parseInt(certificate.obtainedAttendance) || 200,
      subjectsStudied: certificate.subject || 'English, Hindi, Mathematics, Science, Social Studies',
      generalConduct: generalConduct,
      behaviorRemarks: certificate.behaviorRemarks || '',
      feesPaidUpTo: certificate.feesPaidUpTo || certificate.feesUpToDate,
      tcCharge: parseFloat(certificate.tcCharge) || 0,
      feeConcession: mapEnumValue(feeConcession, concessionMapping),
      gamesPlayed: certificate.gamesPlayed || [],
      extraActivities: certificate.extraActivity || [],
      tcNumber: certificate.tcNo || '',
      issuedDate: certificate.dateOfIssue || new Date().toISOString()
    };

    console.log('[DEBUG] Mapped TC update data for backend:', tcData);

    // Get TC ID from admission number
    const tcId = await getTcIdFromAdmissionNumber(certificate.admissionNumber);

    const response = await fetch(`${API_BASE_URL}/tcs/${tcId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tcData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json();
      console.error('[ERROR] TC Update failed:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to update certificate');
    }
    
    const result = await response.json();
    console.log('[DEBUG] TC Update successful:', result);
    return result.data || result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating certificate:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred while updating certificate');
  }
};

// Helper function to get student ID from admission number
export async function getStudentIdFromAdmissionNumber(admissionNumber: string): Promise<number> {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log(`[DEBUG] Looking up student ID for admission number: "${admissionNumber}"`);
    
    // Try TC-specific endpoint first
    const tcEndpoint = `${API_BASE_URL}/students/lookup/${admissionNumber}`;
    console.log(`[DEBUG] Trying TC endpoint: ${tcEndpoint}`);
    
    try {
      const response = await fetch(tcEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[DEBUG] TC endpoint response:`, data);
        
        if (data && data.id) {
          console.log(`[DEBUG] Student ID found via TC endpoint: ${data.id}`);
          return Number(data.id);
        }
        
        if (data && data.data && data.data.id) {
          console.log(`[DEBUG] Student ID found via TC endpoint (nested): ${data.data.id}`);
          return Number(data.data.id);
        }
      }
      
      console.log(`[DEBUG] TC endpoint failed with status: ${response.status}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`[DEBUG] TC endpoint error: ${error.message}`);
      }
    }
    
    // Try the student API endpoint
    const studentEndpoint = `${API_BASE_URL}/students/admission/${admissionNumber}`;
    console.log(`[DEBUG] Trying student endpoint: ${studentEndpoint}`);
    
    try {
      const response = await fetch(studentEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`[DEBUG] Student endpoint response:`, result);
        
        if (result && result.success && result.data && result.data.id) {
          console.log(`[DEBUG] Student ID found via students endpoint: ${result.data.id}`);
          return Number(result.data.id);
        }
      }
      
      console.log(`[DEBUG] Students endpoint failed with status: ${response.status}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`[DEBUG] Students endpoint error: ${error.message}`);
      }
    }
    
    // Try searching for students with this admission number
    const searchEndpoint = `${API_BASE_URL}/students?admissionNo=${admissionNumber}`;
    console.log(`[DEBUG] Trying search endpoint: ${searchEndpoint}`);
    
    try {
      const searchResponse = await fetch(searchEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        console.log(`[DEBUG] Search endpoint response:`, searchResult);
        
        if (searchResult && searchResult.success && searchResult.data && searchResult.data.length > 0) {
          const studentId = Number(searchResult.data[0].id);
          console.log(`[DEBUG] Student ID found via search: ${studentId}`);
          return studentId;
        }
      }
      
      console.log(`[DEBUG] Search endpoint failed with status: ${searchResponse.status}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`[DEBUG] Search endpoint error: ${error.message}`);
      }
    }
    
    // If all endpoints fail, return a default ID or throw error
    console.warn(`[WARN] Could not find student ID for admission number: ${admissionNumber}, using default ID: 1`);
    return 1; // Return default ID as fallback
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[ERROR] Error getting student ID from admission number ${admissionNumber}:`, error.message);
      throw error;
    }
    throw new Error(`An unknown error occurred while getting student ID for admission number ${admissionNumber}`);
  }
}

// Helper function to get TC ID from admission number
async function getTcIdFromAdmissionNumber(admissionNumber: string): Promise<number> {
  try {
    const schoolId = await getSchoolId('', '');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log(`[DEBUG] Looking up TC for admission number: ${admissionNumber} in school: ${schoolId}`);
    
    const response = await fetch(`${API_BASE_URL}/tcs?admissionNumber=${admissionNumber}&schoolId=${schoolId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      console.log(`[DEBUG] TC lookup failed with status: ${response.status}`);
      throw new Error(`Certificate with admission number ${admissionNumber} not found (HTTP ${response.status})`);
    }
    
    const result = await response.json();
    console.log(`[DEBUG] Raw TC lookup response:`, result);
    
    // Handle different response formats
    let data = result;
    
    // Check if response has success/data structure
    if (result && typeof result === 'object' && result.success !== undefined) {
      if (result.success && result.data) {
        data = result.data;
      } else {
        throw new Error(result.error || result.message || 'API request failed');
      }
    }
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.log(`[DEBUG] Response data is not an array:`, data);
      throw new Error(`Invalid response format: expected array, got ${typeof data}`);
    }
    
    console.log(`[DEBUG] Found ${data.length} certificates for admission number: ${admissionNumber}`);
    
    if (data.length === 0) {
      throw new Error(`No certificate found with admission number ${admissionNumber}`);
    }
    
    // Validate the certificate object
    const certificate = data[0];
    if (!certificate || typeof certificate !== 'object') {
      throw new Error(`Invalid certificate data format`);
    }
    
    if (!certificate.id) {
      console.log(`[DEBUG] Certificate missing ID:`, certificate);
      throw new Error(`Certificate found but missing ID field`);
    }
    
    const tcId = Number(certificate.id);
    if (isNaN(tcId) || tcId <= 0) {
      throw new Error(`Invalid certificate ID: ${certificate.id}`);
    }
    
    console.log(`[DEBUG] Using certificate ID: ${tcId}`);
    return tcId;
  } catch (error) {
    console.error(`[ERROR] Error getting TC ID from admission number ${admissionNumber}:`, error);
    throw error;
  }
}