import { IssuedCertificate, StudentDetails } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

// Get current school ID from API login or localStorage
const getSchoolId = async (email?: string, password?: string): Promise<number> => {
  // If no credentials provided, try to get from localStorage
  if (!email || !password) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 1; // Default to 1 if not found
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
      localStorage.setItem('user', JSON.stringify(data.data.user));
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
    // Try the TC-specific endpoint first
    const tcEndpoint = `${API_BASE_URL}/students/details/${admissionNumber}`;
    console.log(`[DEBUG] Fetching student data from: ${tcEndpoint}`);
    
    try {
      console.log(`[DEBUG] Attempting to fetch student with admission number: "${admissionNumber}" via TC endpoint`);
      const response = await fetch(tcEndpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[DEBUG] TC endpoint error: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`Student not found (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[DEBUG] Student data fetched successfully via TC endpoint:', data);
      
      // Format and return the data
      return formatStudentData(data);
    } catch (tcError) {
      console.log(`[DEBUG] Failed to fetch via TC endpoint: ${tcError.message}`);
      
      // Try the student-specific endpoint
      const studentLookupEndpoint = `${API_BASE_URL}/students/lookup/${admissionNumber}`;
      console.log(`[DEBUG] Trying student lookup endpoint: ${studentLookupEndpoint}`);
      
      try {
        const lookupResponse = await fetch(studentLookupEndpoint);
        
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
            
            const detailResponse = await fetch(studentDetailEndpoint);
            if (detailResponse.ok) {
              const studentDetails = await detailResponse.json();
              console.log(`[DEBUG] Student details fetched:`, studentDetails);
              return formatStudentDetailsFromStudentAPI(studentDetails);
            }
          }
        }
      } catch (lookupError) {
        console.log(`[DEBUG] Error in student lookup: ${lookupError.message}`);
      }
      
      // If that also fails, try the regular students endpoint
      const studentEndpoint = `${API_BASE_URL}/students/admission/${admissionNumber}`;
      console.log(`[DEBUG] Trying regular students endpoint: ${studentEndpoint}`);
      
      const response = await fetch(studentEndpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[DEBUG] Students endpoint error: ${response.status}`, errorData);
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
  } catch (error) {
    console.error('[ERROR] Error fetching student data:', error);
    throw error;
  }
};

// Helper function to format student data from the TC API format
const formatStudentData = (data: any): StudentDetails => {
  // Standardize class name format
  let classInfo = data.currentClass || '';
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

  return {
    studentId: data.studentId,
    schoolId: data.schoolId,
    fullName: data.fullName,
    fatherName: data.fatherName || '',
    motherName: data.motherName || '',
    nationality: data.nationality || 'Indian',
    category: data.category || 'General',
    dateOfBirth: data.dateOfBirth,
    dateOfAdmission: data.dateOfAdmission,
    section: data.section || '',
    admissionNumber: data.admissionNumber,
    currentClass: classInfo,
    admitClass: data.admitClass || classInfo,
    academicYear: data.academicYear || new Date().getFullYear().toString(),
    rollNo: data.rollNo || '',
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
    schoolDetails: data.schoolDetails || {
      schoolName: '',
      address: '',
      recognitionId: '',
      affiliationNo: '',
      contact: '',
      email: '',
      website: '',
      imageUrl: ''
    }
  };
};

// Helper function to format student data from the Student API
const formatStudentDetailsFromStudentAPI = (student: any): StudentDetails => {
  // Standardize class name format
  let classInfo = student.className || '';
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
  
  return {
    studentId: student.id,
    schoolId: student.schoolId,
    fullName: `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
    fatherName: student.fatherName || '',
    motherName: student.motherName || '',
    nationality: student.nationality || 'Indian',
    category: student.category || 'General',
    dateOfBirth: student.dateOfBirth,
    dateOfAdmission: student.admissionDate,
    section: student.section || '',
    admissionNumber: student.admissionNo,
    currentClass: classInfo,
    admitClass: student.sessionInfo?.admitClass || classInfo,
    academicYear: new Date().getFullYear().toString(),
    rollNo: student.rollNumber || '',
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
    schoolDetails: {
      schoolName: student.school?.fullName || '',
      address: student.school?.address || '',
      recognitionId: student.school?.code || '',
      affiliationNo: '',
      contact: student.school?.contact?.toString() || '',
      email: student.school?.email || '',
      website: '',
      imageUrl: ''
    }
  };
};

export const fetchIssuedCertificates = async (): Promise<IssuedCertificate[]> => {
  try {
    const schoolId = await getSchoolId('', '');
    // Use the tcform routes
    const response = await fetch(`${API_BASE_URL}/tcs?schoolId=${schoolId}`);
    if (!response.ok) throw new Error('Failed to fetch certificates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching issued certificates:', error);
    throw error;
  }
};

export const createCertificate = async (certificate: IssuedCertificate): Promise<IssuedCertificate> => {
  try {
    const schoolId = await getSchoolId('', '');
    
    // Map frontend model to backend model
    const tcData = {
      schoolId: schoolId,
      // Find student ID from admission number or use the one in the certificate
      studentId: certificate.studentId || await getStudentIdFromAdmissionNumber(certificate.admissionNumber),
      admissionNumber: certificate.admissionNumber,
      fatherName: certificate.fatherName,
      motherName: certificate.motherName,
      dateOfBirth: certificate.dateOfBirth,
      nationality: certificate.nationality,
      category: certificate.category,
      dateOfAdmission: certificate.dateOfAdmission,
      currentClass: certificate.studentClass,
      whetherFailed: certificate.whetherFailed,
      section: certificate.section || "", // Default empty string if not available
      rollNumber: certificate.rollNo || "",
      examAppearedIn: certificate.examIn,
      qualifiedForPromotion: certificate.qualified,
      reasonForLeaving: certificate.reason,
      dateOfLeaving: certificate.dateOfLeaving,
      lastAttendanceDate: certificate.lastAttendanceDate,
      toClass: certificate.toClass,
      classInWords: certificate.classInWords,
      maxAttendance: parseInt(certificate.maxAttendance) || 0,
      obtainedAttendance: parseInt(certificate.obtainedAttendance) || 0,
      subjectsStudied: certificate.subject,
      generalConduct: certificate.generalConduct,
      behaviorRemarks: certificate.behaviorRemarks,
      feesPaidUpTo: certificate.feesPaidUpTo,
      tcCharge: parseFloat(certificate.tcCharge) || 0,
      feeConcession: certificate.feesConcessionAvailed,
      gamesPlayed: certificate.gamesPlayed,
      extraActivities: certificate.extraActivity
    };

    const response = await fetch(`${API_BASE_URL}/tcs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tcData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create certificate');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

export const deleteCertificate = async (admissionNumber: string): Promise<void> => {
  try {
    // Find the TC ID by admission number
    const tcId = await getTcIdFromAdmissionNumber(admissionNumber);
    
    const response = await fetch(`${API_BASE_URL}/tcs/${tcId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
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
    const schoolId = await getSchoolId('', '');
    
    // Map frontend model to backend model
    const tcData = {
      schoolId: schoolId,
      studentId: certificate.studentId || await getStudentIdFromAdmissionNumber(certificate.admissionNumber),
      admissionNumber: certificate.admissionNumber,
      fatherName: certificate.fatherName,
      motherName: certificate.motherName,
      dateOfBirth: certificate.dateOfBirth,
      nationality: certificate.nationality,
      category: certificate.category,
      dateOfAdmission: certificate.dateOfAdmission,
      currentClass: certificate.studentClass,
      whetherFailed: certificate.whetherFailed,
      section: certificate.section || "",
      rollNumber: certificate.rollNo || "",
      examAppearedIn: certificate.examIn,
      qualifiedForPromotion: certificate.qualified,
      reasonForLeaving: certificate.reason,
      dateOfLeaving: certificate.dateOfLeaving,
      lastAttendanceDate: certificate.lastAttendanceDate,
      toClass: certificate.toClass,
      classInWords: certificate.classInWords,
      maxAttendance: parseInt(certificate.maxAttendance) || 0,
      obtainedAttendance: parseInt(certificate.obtainedAttendance) || 0,
      subjectsStudied: certificate.subject,
      generalConduct: certificate.generalConduct,
      behaviorRemarks: certificate.behaviorRemarks,
      feesPaidUpTo: certificate.feesPaidUpTo,
      tcCharge: parseFloat(certificate.tcCharge) || 0,
      feeConcession: certificate.feesConcessionAvailed,
      gamesPlayed: certificate.gamesPlayed,
      extraActivities: certificate.extraActivity
    };

    // Get TC ID from admission number
    const tcId = await getTcIdFromAdmissionNumber(certificate.admissionNumber);

    const response = await fetch(`${API_BASE_URL}/tcs/${tcId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tcData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update certificate');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

// Helper function to get student ID from admission number
async function getStudentIdFromAdmissionNumber(admissionNumber: string): Promise<number> {
  try {
    // Try TC-specific endpoint first
    const tcEndpoint = `${API_BASE_URL}/students/lookup/${admissionNumber}`;
    console.log(`[DEBUG] Looking up student ID from: ${tcEndpoint}`);
    
    try {
      const response = await fetch(tcEndpoint);
      if (!response.ok) {
        console.log(`[DEBUG] TC lookup failed with status: ${response.status}`);
        throw new Error('Student lookup failed via TC endpoint');
      }
      const data = await response.json();
      console.log(`[DEBUG] Student ID found via TC endpoint: ${data.id}`);
      return data.id;
    } catch (tcError) {
      console.log(`[DEBUG] Failed via TC endpoint: ${tcError.message}, trying students endpoint`);
      
      // If that fails, try the student API endpoint
      const studentEndpoint = `${API_BASE_URL}/students/admission/${admissionNumber}`;
      console.log(`[DEBUG] Trying backup endpoint: ${studentEndpoint}`);
      
      const response = await fetch(studentEndpoint);
      if (!response.ok) {
        console.log(`[DEBUG] Students endpoint failed with status: ${response.status}`);
        
        // Try one more approach - search for students with this admission number
        console.log(`[DEBUG] Trying to search for students with admission number: ${admissionNumber}`);
        const searchEndpoint = `${API_BASE_URL}/students?admissionNo=${admissionNumber}`;
        const searchResponse = await fetch(searchEndpoint);
        if (!searchResponse.ok) {
          console.log(`[DEBUG] Student search failed with status: ${searchResponse.status}`);
          throw new Error(`Student with admission number ${admissionNumber} not found after trying all endpoints`);
        }
        
        const searchResult = await searchResponse.json();
        if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
          console.log(`[DEBUG] No students found in search results`);
          throw new Error(`Student with admission number ${admissionNumber} not found`);
        }
        
        console.log(`[DEBUG] Student ID found via search: ${searchResult.data[0].id}`);
        return searchResult.data[0].id;
      }
      
      const result = await response.json();
      if (!result.success || !result.data) {
        console.log(`[DEBUG] Invalid response format from students endpoint:`, result);
        throw new Error('Invalid response format or student not found');
      }
      
      console.log(`[DEBUG] Student ID found via students endpoint: ${result.data.id}`);
      return result.data.id;
    }
  } catch (error) {
    console.error(`[ERROR] Error getting student ID from admission number ${admissionNumber}:`, error);
    throw error;
  }
}

// Helper function to get TC ID from admission number
async function getTcIdFromAdmissionNumber(admissionNumber: string): Promise<number> {
  try {
    const schoolId = await getSchoolId('', '');
    console.log(`[DEBUG] Looking up TC for admission number: ${admissionNumber} in school: ${schoolId}`);
    
    const response = await fetch(`${API_BASE_URL}/tcs?admissionNumber=${admissionNumber}&schoolId=${schoolId}`);
    if (!response.ok) {
      console.log(`[DEBUG] TC lookup failed with status: ${response.status}`);
      throw new Error(`Certificate with admission number ${admissionNumber} not found`);
    }
    
    const data = await response.json();
    console.log(`[DEBUG] Found ${data.length} certificates for admission number: ${admissionNumber}`);
    
    if (data.length === 0) {
      throw new Error(`Certificate with admission number ${admissionNumber} not found`);
    }
    
    console.log(`[DEBUG] Using certificate ID: ${data[0].id}`);
    return data[0].id;
  } catch (error) {
    console.error(`[ERROR] Error getting TC ID from admission number ${admissionNumber}:`, error);
    throw error;
  }
}
