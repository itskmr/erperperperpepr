import jsPDF from 'jspdf';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export interface SchoolInfo {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  principal?: string;
  established?: number;
}

// Helper function to fetch school information
const fetchSchoolInfo = async (): Promise<SchoolInfo> => {
  try {
    const response = await axios.get(`${API_URL}/transport/school-info`);
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching school info:', error);
  }
  
  // Fallback to default values
  return {
    schoolName: 'Excellence School System',
    address: '123 Education Street, Learning City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@excellenceschool.edu',
    principal: 'Dr. John Smith',
    established: 2000
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