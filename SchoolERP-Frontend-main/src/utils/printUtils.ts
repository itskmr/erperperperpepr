import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// School information interface
interface SchoolInfo {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  principal?: string;
  established?: number;
  image_url?: string | null;
}

interface StudentData {
  fullName?: string;
  admissionNo?: string;
  admissionDate?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  category?: string;
  religion?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  mobileNumber?: string;
  email?: string;
  fatherName?: string;
  motherName?: string;
  address?: {
    houseNo?: string;
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    permanentHouseNo?: string;
    permanentStreet?: string;
    permanentCity?: string;
    permanentState?: string;
    permanentPinCode?: string;
  };
  admitSession?: {
    class?: string;
    section?: string;
    rollNo?: string;
    group?: string;
    stream?: string;
  };
  currentSession?: {
    class?: string;
    section?: string;
    rollNo?: string;
    group?: string;
    stream?: string;
  };
  father?: {
    name?: string;
    qualification?: string;
    occupation?: string;
    contactNumber?: string;
    email?: string;
    aadhaarNo?: string;
    annualIncome?: string;
  };
  mother?: {
    name?: string;
    qualification?: string;
    occupation?: string;
    contactNumber?: string;
    email?: string;
    aadhaarNo?: string;
    annualIncome?: string;
  };
  guardian?: {
    name?: string;
    address?: string;
    contactNumber?: string;
    email?: string;
    aadhaarNo?: string;
    occupation?: string;
    annualIncome?: string;
  };
  transport?: {
    mode?: string;
    area?: string;
    route?: string;
    driver?: string;
    pickupLocation?: string;
    dropLocation?: string;
  };
  lastEducation?: {
    school?: string;
    address?: string;
    tcDate?: string;
    prevClass?: string;
    percentage?: string;
    attendance?: string;
    extraActivity?: string;
  };
  other?: {
    belongToBPL?: string;
    minority?: string;
    disability?: string;
    accountNo?: string;
    bank?: string;
    ifscCode?: string;
    medium?: string;
    lastYearResult?: string;
    singleParent?: string;
    onlyChild?: string;
    onlyGirlChild?: string;
    adoptedChild?: string;
    siblingAdmissionNo?: string;
    transferCase?: string;
    livingWith?: string;
    motherTongue?: string;
    admissionType?: string;
    udiseNo?: string;
  };
  studentImageUrl?: string;
  fatherImageUrl?: string;
  motherImageUrl?: string;
  guardianImageUrl?: string;
  signatureUrl?: string;
  parentSignatureUrl?: string;
  birthCertificateUrl?: string;
  transferCertificateUrl?: string;
  markSheetUrl?: string;
  aadhaarCardUrl?: string;
  familyIdUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber?: string;
  contactNumber: string;
  address?: string;
  experience: number;
  joiningDate: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  qualification?: string;
  salary?: number;
  isActive: boolean;
  photo?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber?: string;
  vehicleName: string;
  model?: string;
  capacity?: number;
  fuelType?: string;
  purchaseDate?: string;
  insuranceExpiryDate?: string;
  lastMaintenanceDate?: string;
  lastInspectionDate?: string;
  currentOdometer?: number;
  status: string;
  notes?: string;
  driver?: {
    id: string;
    name: string;
    contactNumber: string;
  };
}

export interface TransportRoute {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  description?: string;
  distance?: number;
  estimatedTime?: number;
  vehicleId?: string;
  driverId?: string;
  isActive: boolean;
  vehicle?: {
    id: string;
    vehicleName: string;
    registrationNumber?: string;
  };
  driver?: {
    id: string;
    name: string;
    contactNumber: string;
  };
}

// Helper function to fetch school information
const fetchSchoolInfo = async (): Promise<SchoolInfo> => {
  try {
    const response = await axios.get(`${API_URL}/school/info`);
    
    if (response.data.success && response.data.data) {
      return {
        schoolName: response.data.data.schoolName || 'School Name',
        address: response.data.data.address || 'School Address',
        phone: response.data.data.phone || 'Phone Number',
        email: response.data.data.email || 'Email Address',
        principal: response.data.data.principal || 'Principal Name',
        established: response.data.data.established || new Date().getFullYear(),
        image_url: response.data.data.image_url || null
      };
    }
  } catch (error: unknown) {
    console.error('Error fetching school info from API:', error);
  }
  
  // Return fallback school info if API fails
  console.log('Using fallback school information');
  return {
    schoolName: 'Excellence School System',
    address: '123 Education Street, Learning City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@excellenceschool.edu',
    principal: 'Dr. John Smith',
    established: 2000,
    image_url: null
  };
};

// Helper function to add school header
const addSchoolHeader = async (doc: jsPDF): Promise<number> => {
  const schoolInfo = await fetchSchoolInfo();

  // School header
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text(schoolInfo.schoolName, 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99); // Gray color
  doc.text(schoolInfo.address, 20, 28);
  doc.text(`Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}`, 20, 34);
  
  // Add line separator
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 40, 190, 40);
  
  return 45; // Return the Y position where content should start
};

// Driver PDF Generator
export const generateDriverPDF = async (driver: Driver): Promise<void> => {
  const doc = new jsPDF();
  
  // Add school header
  let yPosition = await addSchoolHeader(doc);
  
  // Document title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Driver Profile', 20, yPosition);
  yPosition += 5;
  
  // Add line
  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Personal Information Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Personal Information', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.text(`Name: ${driver.name}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Contact Number: ${driver.contactNumber}`, 20, yPosition);
  yPosition += 8;
  
  if (driver.dateOfBirth) {
    doc.text(`Date of Birth: ${new Date(driver.dateOfBirth).toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.age) {
    doc.text(`Age: ${driver.age} years`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.gender) {
    doc.text(`Gender: ${driver.gender}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.maritalStatus) {
    doc.text(`Marital Status: ${driver.maritalStatus}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.bloodGroup) {
    doc.text(`Blood Group: ${driver.bloodGroup}`, 20, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Professional Information Section
  doc.setFontSize(16);
  doc.text('Professional Information', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  if (driver.licenseNumber) {
    doc.text(`License Number: ${driver.licenseNumber}`, 20, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Experience: ${driver.experience} years`, 20, yPosition);
  yPosition += 8;
  doc.text(`Joining Date: ${new Date(driver.joiningDate).toLocaleDateString()}`, 20, yPosition);
  yPosition += 8;
  
  if (driver.qualification) {
    doc.text(`Qualification: ${driver.qualification}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.salary) {
    doc.text(`Salary: ₹${driver.salary.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Status: ${driver.isActive ? 'Active' : 'Inactive'}`, 20, yPosition);
  yPosition += 8;
  
  if (driver.address) {
    yPosition += 5;
    doc.text(`Address: ${driver.address}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (driver.emergencyContact) {
    doc.text(`Emergency Contact: ${driver.emergencyContact}`, 20, yPosition);
    yPosition += 8;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 280);
  
  // Open in new tab for printing
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

// Vehicle PDF Generator
export const generateVehiclePDF = async (vehicle: Vehicle): Promise<void> => {
  const doc = new jsPDF();
  
  // Add school header
  let yPosition = await addSchoolHeader(doc);
  
  // Document title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('Vehicle Profile', 20, yPosition);
  yPosition += 5;
  
  // Add line
  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Vehicle Information Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Vehicle Information', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.text(`Vehicle Name: ${vehicle.vehicleName}`, 20, yPosition);
  yPosition += 8;
  
  if (vehicle.registrationNumber) {
    doc.text(`Registration Number: ${vehicle.registrationNumber}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (vehicle.model) {
    doc.text(`Model: ${vehicle.model}`, 20, yPosition);
    yPosition += 8;
  }
  
  // Highlight capacity prominently
  if (vehicle.capacity) {
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(`Seating Capacity: ${vehicle.capacity} passengers`, 20, yPosition);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
  }
  
  if (vehicle.fuelType) {
    doc.text(`Fuel Type: ${vehicle.fuelType}`, 20, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Status: ${vehicle.status}`, 20, yPosition);
  yPosition += 8;
  
  if (vehicle.currentOdometer) {
    doc.text(`Current Odometer: ${vehicle.currentOdometer.toLocaleString()} km`, 20, yPosition);
    yPosition += 15;
  }
  
  // Important Dates Section
  doc.setFontSize(16);
  doc.text('Important Dates', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  if (vehicle.purchaseDate) {
    doc.text(`Purchase Date: ${new Date(vehicle.purchaseDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (vehicle.insuranceExpiryDate) {
    doc.text(`Insurance Expiry: ${new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (vehicle.lastMaintenanceDate) {
    doc.text(`Last Maintenance: ${new Date(vehicle.lastMaintenanceDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (vehicle.lastInspectionDate) {
    doc.text(`Last Inspection: ${new Date(vehicle.lastInspectionDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;
  }
  
  // Driver Information Section
  if (vehicle.driver) {
    doc.setFontSize(16);
    doc.text('Assigned Driver', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Driver Name: ${vehicle.driver.name}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Contact: ${vehicle.driver.contactNumber}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (vehicle.notes) {
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Notes', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    const splitNotes = doc.splitTextToSize(vehicle.notes, 150);
    doc.text(splitNotes, 20, yPosition);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 280);
  
  // Open in new tab for printing
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

// Transport Route PDF Generator
export const generateTransportRoutePDF = async (route: TransportRoute): Promise<void> => {
  const doc = new jsPDF();
  
  // Add school header
  let yPosition = await addSchoolHeader(doc);
  
  // Document title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('Transport Route Details', 20, yPosition);
  yPosition += 5;
  
  // Add line
  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Route Information Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Route Information', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.text(`Route Name: ${route.name}`, 20, yPosition);
  yPosition += 8;
  doc.text(`From: ${route.fromLocation}`, 20, yPosition);
  yPosition += 8;
  doc.text(`To: ${route.toLocation}`, 20, yPosition);
  yPosition += 8;
  
  if (route.distance) {
    doc.text(`Distance: ${route.distance} km`, 20, yPosition);
    yPosition += 8;
  }
  
  if (route.estimatedTime) {
    doc.text(`Estimated Time: ${route.estimatedTime} minutes`, 20, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Status: ${route.isActive ? 'Active' : 'Inactive'}`, 20, yPosition);
  yPosition += 8;
  
  if (route.description) {
    yPosition += 5;
    doc.text('Description:', 20, yPosition);
    yPosition += 5;
    const splitDescription = doc.splitTextToSize(route.description, 150);
    doc.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 5 + 10;
  }
  
  // Vehicle Information Section
  yPosition += 5;
  doc.setFontSize(16);
  doc.text('Assigned Vehicle', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  if (route.vehicle) {
    doc.text(`Vehicle Name: ${route.vehicle.vehicleName}`, 20, yPosition);
    yPosition += 8;
    if (route.vehicle.registrationNumber) {
      doc.text(`Registration Number: ${route.vehicle.registrationNumber}`, 20, yPosition);
      yPosition += 8;
    }
  } else {
    doc.setTextColor(128, 128, 128);
    doc.text('No vehicle assigned', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  }
  
  // Driver Information Section
  yPosition += 5;
  doc.setFontSize(16);
  doc.text('Assigned Driver', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  if (route.driver) {
    doc.text(`Driver Name: ${route.driver.name}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Contact Number: ${route.driver.contactNumber}`, 20, yPosition);
    yPosition += 8;
  } else {
    doc.setTextColor(128, 128, 128);
    doc.text('No driver assigned', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 280);
  
  // Open in new tab for printing
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

// Function to generate admission form print layout
export const generateAdmissionFormPrint = async (studentData: StudentData) => {
  const schoolInfo = await fetchSchoolInfo();
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admission Form - ${studentData.fullName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .admission-form {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .school-logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 10px;
          display: block;
        }
        .school-name {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0 5px;
          text-transform: uppercase;
        }
        .school-details {
          font-size: 12px;
          margin: 5px 0;
        }
        .form-title {
          background: #000;
          color: white;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          margin: 20px 0;
        }
        .form-section {
          margin: 15px 0;
        }
        .section-title {
          background: #f0f0f0;
          padding: 5px 10px;
          font-weight: bold;
          border: 1px solid #000;
          margin: 10px 0 5px;
        }
        .form-row {
          display: flex;
          margin: 8px 0;
          align-items: center;
        }
        .form-field {
          flex: 1;
          margin: 0 10px;
        }
        .field-label {
          font-weight: bold;
          margin-right: 5px;
        }
        .field-value {
          border-bottom: 1px solid #000;
          min-height: 20px;
          padding: 2px 5px;
        }
        .photo-box {
          width: 120px;
          height: 150px;
          border: 2px solid #000;
          margin: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          text-align: center;
        }
        .signature-box {
          width: 150px;
          height: 50px;
          border: 1px solid #000;
          margin: 10px 0;
          display: inline-block;
          text-align: center;
          padding-top: 30px;
          font-size: 12px;
        }
        .declaration {
          border: 1px solid #000;
          padding: 10px;
          margin: 20px 0;
          font-size: 11px;
          text-align: justify;
        }
        @media print {
          body { margin: 0; }
          .admission-form { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="admission-form">
        <!-- Header -->
        <div class="header">
          ${schoolInfo.image_url ? `<img src="${schoolInfo.image_url}" alt="School Logo" class="school-logo" />` : ''}
          <div class="school-name">${schoolInfo.schoolName}</div>
          <div class="school-details">${schoolInfo.address}</div>
          <div class="school-details">Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}</div>
          ${schoolInfo.principal ? `<div class="school-details">Principal: ${schoolInfo.principal}</div>` : ''}
        </div>

        <div class="form-title">ADMISSION FORM</div>

        <!-- Student Information -->
        <div class="form-section">
          <div class="section-title">1. STUDENT INFORMATION</div>
          <div style="display: flex;">
            <div style="flex: 1;">
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Admission No.:</span>
                  <span class="field-value">${studentData.admissionNo || ''}</span>
                </div>
                <div class="form-field">
                  <span class="field-label">Admission Date:</span>
                  <span class="field-value">${studentData.admissionDate ? new Date(studentData.admissionDate).toLocaleDateString() : ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Name (In Block Letters):</span>
                  <span class="field-value">${studentData.fullName || ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Class for admission:</span>
                  <span class="field-value">${studentData.admitSession?.class || studentData.currentSession?.class || ''}</span>
                </div>
                <div class="form-field">
                  <span class="field-label">Section:</span>
                  <span class="field-value">${studentData.admitSession?.section || studentData.currentSession?.section || ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Date of Birth:</span>
                  <span class="field-value">${studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toLocaleDateString() : ''}</span>
                </div>
                <div class="form-field">
                  <span class="field-label">Age:</span>
                  <span class="field-value">${studentData.age || ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Gender:</span>
                  <span class="field-value">${studentData.gender || ''}</span>
                </div>
                <div class="form-field">
                  <span class="field-label">Category:</span>
                  <span class="field-value">${studentData.category || ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Religion:</span>
                  <span class="field-value">${studentData.religion || ''}</span>
                </div>
                <div class="form-field">
                  <span class="field-label">Blood Group:</span>
                  <span class="field-value">${studentData.bloodGroup || ''}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <span class="field-label">Aadhaar Number:</span>
                  <span class="field-value">${studentData.aadhaarNumber || ''}</span>
                </div>
              </div>
            </div>
            <div class="photo-box">
              ${studentData.studentImageUrl ? `<img src="${studentData.studentImageUrl}" style="max-width: 100%; max-height: 100%;" />` : 'Student Photo'}
            </div>
          </div>
        </div>

        <!-- Father's Information -->
        <div class="form-section">
          <div class="section-title">2. FATHER'S INFORMATION</div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Father's Name:</span>
              <span class="field-value">${studentData.father?.name || studentData.fatherName || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Qualification:</span>
              <span class="field-value">${studentData.father?.qualification || ''}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Occupation:</span>
              <span class="field-value">${studentData.father?.occupation || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Mobile No.:</span>
              <span class="field-value">${studentData.father?.contactNumber || ''}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Email:</span>
              <span class="field-value">${studentData.father?.email || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Annual Income:</span>
              <span class="field-value">${studentData.father?.annualIncome || ''}</span>
            </div>
          </div>
        </div>

        <!-- Mother's Information -->
        <div class="form-section">
          <div class="section-title">3. MOTHER'S INFORMATION</div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Mother's Name:</span>
              <span class="field-value">${studentData.mother?.name || studentData.motherName || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Qualification:</span>
              <span class="field-value">${studentData.mother?.qualification || ''}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Occupation:</span>
              <span class="field-value">${studentData.mother?.occupation || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Mobile No.:</span>
              <span class="field-value">${studentData.mother?.contactNumber || ''}</span>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="form-section">
          <div class="section-title">4. ADDRESS INFORMATION</div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Present Address:</span>
              <span class="field-value">${studentData.address?.houseNo || ''} ${studentData.address?.street || ''}, ${studentData.address?.city || ''}, ${studentData.address?.state || ''} - ${studentData.address?.pinCode || ''}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Permanent Address:</span>
              <span class="field-value">${studentData.address?.permanentHouseNo || ''} ${studentData.address?.permanentStreet || ''}, ${studentData.address?.permanentCity || ''}, ${studentData.address?.permanentState || ''} - ${studentData.address?.permanentPinCode || ''}</span>
            </div>
          </div>
        </div>

        <!-- Previous School Information -->
        <div class="form-section">
          <div class="section-title">5. PREVIOUS SCHOOL DETAILS</div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">School Name:</span>
              <span class="field-value">${studentData.lastEducation?.school || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">Class:</span>
              <span class="field-value">${studentData.lastEducation?.prevClass || ''}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Result:</span>
              <span class="field-value">${studentData.lastEducation?.percentage || ''}</span>
            </div>
            <div class="form-field">
              <span class="field-label">TC Date:</span>
              <span class="field-value">${studentData.lastEducation?.tcDate ? new Date(studentData.lastEducation.tcDate).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>

        <!-- Declaration -->
        <div class="declaration">
          <strong>Declaration:</strong> I hereby declare that the above information including Name of the Candidate, Father's, Guardian's, Mother's and Date of Birth furnished by me is correct to the best of my knowledge and belief. I shall abide by the rules of the school.
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="text-align: center;">
            <div class="signature-box">Father's Signature</div>
          </div>
          <div style="text-align: center;">
            <div class="signature-box">Mother's Signature</div>
          </div>
          <div style="text-align: center;">
            <div class="signature-box">Guardian's Signature</div>
          </div>
        </div>

        <!-- Office Use -->
        <div class="form-section" style="margin-top: 30px;">
          <div class="section-title">FOR OFFICE USE ONLY</div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Admission No.:</span>
              <span class="field-value"></span>
            </div>
            <div class="form-field">
              <span class="field-label">Receipt No.:</span>
              <span class="field-value"></span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Admission Date:</span>
              <span class="field-value"></span>
            </div>
            <div class="form-field">
              <span class="field-label">Payment Mode:</span>
              <span class="field-value"></span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <span class="field-label">Admitted Class:</span>
              <span class="field-value"></span>
            </div>
            <div class="form-field">
              <span class="field-label">Paid Amount:</span>
              <span class="field-value"></span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #000; width: 150px; margin: 0 auto 5px;">Checked By</div>
            </div>
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #000; width: 150px; margin: 0 auto 5px;">Verified By</div>
            </div>
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #000; width: 150px; margin: 0 auto 5px;">Approved By</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for images to load then print
  setTimeout(() => {
    printWindow.print();
  }, 1000);
}; 