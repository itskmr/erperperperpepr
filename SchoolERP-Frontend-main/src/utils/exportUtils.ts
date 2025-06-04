import jsPDF from 'jspdf';

// Export format options
export type ExportFormat = 'csv' | 'pdf';

// Generic export configuration
export interface ExportConfig {
  filename: string;
  title: string;
  columns: ExportColumn[];
  data: any[];
  metadata?: {
    generatedBy?: string;
    totalRecords?: number;
    dateRange?: string;
    additionalInfo?: string;
  };
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number; // For PDF column width
  formatter?: (value: any, row: any) => string;
  includeInCSV?: boolean;
  includeInPDF?: boolean;
}

// Utility functions for formatting data
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN');
  } catch {
    return String(date) || 'N/A';
  }
};

export const formatCurrency = (amount: number | string | undefined): string => {
  if (!amount && amount !== 0) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatBoolean = (value: boolean | string | undefined): string => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' ? 'Yes' : 'No';
  }
  return 'No';
};

export const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// CSV Export Function
export const exportToCSV = (config: ExportConfig): void => {
  try {
    const csvColumns = config.columns.filter(col => col.includeInCSV !== false);
    
    // Create headers
    const headers = csvColumns.map(col => col.label);
    
    // Create data rows
    const csvData = config.data.map(row => 
      csvColumns.map(col => {
        let value: any;
        
        // Handle nested keys (e.g., 'father.name')
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], row);
        } else {
          value = row[col.key];
        }
        
        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, row);
        }
        
        // Clean and escape the value for CSV
        const cleanValue = safeString(value);
        
        // Escape quotes and wrap in quotes if necessary
        if (cleanValue.includes(',') || cleanValue.includes('"') || cleanValue.includes('\n')) {
          return `"${cleanValue.replace(/"/g, '""')}"`;
        }
        
        return `"${cleanValue}"`;
      })
    );
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Add UTF-8 BOM for proper Excel support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${config.filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};

// PDF Export Function
export const exportToPDF = (config: ExportConfig): void => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape mode for more columns
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors
    const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
    const secondaryColor: [number, number, number] = [75, 85, 99]; // Gray
    const headerBgColor: [number, number, number] = [248, 250, 252]; // Light gray
    
    let yPosition = margin;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(config.title, margin, yPosition);
    yPosition += 10;
    
    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, margin, yPosition);
    yPosition += 6;
    
    if (config.metadata?.totalRecords) {
      doc.text(`Total Records: ${config.metadata.totalRecords}`, margin, yPosition);
      yPosition += 6;
    }
    
    if (config.metadata?.dateRange) {
      doc.text(`Date Range: ${config.metadata.dateRange}`, margin, yPosition);
      yPosition += 6;
    }
    
    if (config.metadata?.additionalInfo) {
      doc.text(config.metadata.additionalInfo, margin, yPosition);
      yPosition += 6;
    }
    
    // Separator line
    yPosition += 5;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Get PDF columns
    const pdfColumns = config.columns.filter(col => col.includeInPDF !== false);
    const columnWidth = contentWidth / pdfColumns.length;
    
    // Table headers
    doc.setFillColor(...headerBgColor);
    doc.rect(margin, yPosition - 2, contentWidth, 8, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    
    pdfColumns.forEach((col, index) => {
      const x = margin + (index * columnWidth);
      doc.text(col.label, x + 2, yPosition + 4);
    });
    
    yPosition += 10;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    config.data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        
        // Re-add headers on new page
        doc.setFillColor(...headerBgColor);
        doc.rect(margin, yPosition - 2, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        pdfColumns.forEach((col, index) => {
          const x = margin + (index * columnWidth);
          doc.text(col.label, x + 2, yPosition + 4);
        });
        
        yPosition += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }
      
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPosition - 2, contentWidth, 8, 'F');
      }
      
      pdfColumns.forEach((col, colIndex) => {
        let value: any;
        
        // Handle nested keys
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], row);
        } else {
          value = row[col.key];
        }
        
        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, row);
        }
        
        const displayValue = safeString(value);
        const x = margin + (colIndex * columnWidth);
        
        // Truncate text if too long
        const maxWidth = columnWidth - 4;
        const truncatedValue = doc.getTextWidth(displayValue) > maxWidth 
          ? displayValue.substring(0, Math.floor(maxWidth / 2)) + '...'
          : displayValue;
        
        doc.text(truncatedValue, x + 2, yPosition + 4);
      });
      
      yPosition += 8;
    });
    
    // Footer
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin - 20,
        pageHeight - 10
      );
      doc.text(
        `Generated by School ERP System`,
        margin,
        pageHeight - 10
      );
    }
    
    // Save the PDF
    doc.save(`${config.filename}.pdf`);
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF file');
  }
};

// Main export function
export const exportData = (format: ExportFormat, config: ExportConfig): void => {
  if (format === 'csv') {
    exportToCSV(config);
  } else if (format === 'pdf') {
    exportToPDF(config);
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }
};

// Student-specific export configurations
export const getStudentExportConfig = (students: any[]): ExportConfig => ({
  filename: `students_export_${new Date().toISOString().split('T')[0]}`,
  title: 'Student Management Report',
  data: students,
  metadata: {
    totalRecords: students.length,
    generatedBy: 'School ERP System',
    additionalInfo: 'Complete student data including personal, academic, and contact information'
  },
  columns: [
    { key: 'fullName', label: 'Full Name' },
    { key: 'admissionNo', label: 'Admission Number' },
    { key: 'formNo', label: 'Form Number' },
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'gender', label: 'Gender' },
    { key: 'dateOfBirth', label: 'Date of Birth', formatter: formatDate },
    { key: 'age', label: 'Age' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'religion', label: 'Religion' },
    { key: 'category', label: 'Category' },
    { key: 'caste', label: 'Caste' },
    { key: 'aadhaarNumber', label: 'Aadhaar Number' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'email', label: 'Email' },
    { key: 'emergencyContact', label: 'Emergency Contact' },
    { key: 'address.houseNo', label: 'House Number' },
    { key: 'address.street', label: 'Street' },
    { key: 'address.city', label: 'City' },
    { key: 'address.state', label: 'State' },
    { key: 'address.pinCode', label: 'Pin Code' },
    { key: 'father.name', label: 'Father Name' },
    { key: 'father.qualification', label: 'Father Qualification' },
    { key: 'father.occupation', label: 'Father Occupation' },
    { key: 'father.contactNumber', label: 'Father Contact' },
    { key: 'father.email', label: 'Father Email' },
    { key: 'father.aadhaarNo', label: 'Father Aadhaar' },
    { key: 'father.annualIncome', label: 'Father Annual Income', formatter: formatCurrency },
    { key: 'father.isCampusEmployee', label: 'Father Campus Employee', formatter: formatBoolean },
    { key: 'mother.name', label: 'Mother Name' },
    { key: 'mother.qualification', label: 'Mother Qualification' },
    { key: 'mother.occupation', label: 'Mother Occupation' },
    { key: 'mother.contactNumber', label: 'Mother Contact' },
    { key: 'mother.email', label: 'Mother Email' },
    { key: 'mother.aadhaarNo', label: 'Mother Aadhaar' },
    { key: 'mother.annualIncome', label: 'Mother Annual Income', formatter: formatCurrency },
    { key: 'mother.isCampusEmployee', label: 'Mother Campus Employee', formatter: formatBoolean },
    { key: 'guardian.name', label: 'Guardian Name' },
    { key: 'guardian.contactNumber', label: 'Guardian Contact' },
    { key: 'guardian.address', label: 'Guardian Address' },
    { key: 'currentSession.class', label: 'Current Class' },
    { key: 'currentSession.section', label: 'Current Section' },
    { key: 'currentSession.rollNo', label: 'Current Roll Number' },
    { key: 'currentSession.house', label: 'House' },
    { key: 'transport.mode', label: 'Transport Mode' },
    { key: 'transport.route', label: 'Transport Route' },
    { key: 'transport.driver', label: 'Driver' },
    { key: 'other.belongToBPL', label: 'BPL Family', formatter: formatBoolean },
    { key: 'other.singleParent', label: 'Single Parent', formatter: formatBoolean },
    { key: 'other.disability', label: 'Disability' },
    { key: 'other.motherTongue', label: 'Mother Tongue' },
    { key: 'lastEducation.school', label: 'Previous School' },
    { key: 'lastEducation.percentage', label: 'Previous Percentage' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'regnDate', label: 'Registration Date', formatter: formatDate },
    { key: 'createdAt', label: 'Created At', formatter: formatDate }
  ]
});

// Teacher-specific export configurations
export const getTeacherExportConfig = (teachers: any[]): ExportConfig => ({
  filename: `teachers_export_${new Date().toISOString().split('T')[0]}`,
  title: 'Teacher Directory Report',
  data: teachers,
  metadata: {
    totalRecords: teachers.length,
    generatedBy: 'School ERP System',
    additionalInfo: 'Complete teacher data including personal, professional, and contact information'
  },
  columns: [
    { key: 'id', label: 'Teacher ID' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'gender', label: 'Gender' },
    { key: 'dateOfBirth', label: 'Date of Birth', formatter: formatDate },
    { key: 'age', label: 'Age' },
    { key: 'designation', label: 'Designation' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'experience', label: 'Experience (Years)' },
    { key: 'address', label: 'Address' },
    { key: 'subjects', label: 'Subjects', formatter: (value) => Array.isArray(value) ? value.join(', ') : value || 'N/A' },
    { key: 'sections', label: 'Classes & Sections', formatter: (value) => 
      Array.isArray(value) 
        ? value.map((s: any) => `${s.class}-${Array.isArray(s.sections) ? s.sections.join(',') : s.sections || ''}`).join('; ')
        : 'N/A'
    },
    { key: 'joining_year', label: 'Joining Date', formatter: formatDate },
    { key: 'profileImage', label: 'Profile Image' },
    { key: 'isClassIncharge', label: 'Class Incharge', formatter: formatBoolean },
    { key: 'inchargeClass', label: 'Incharge Class' },
    { key: 'inchargeSection', label: 'Incharge Section' },
    { key: 'status', label: 'Status' },
    { key: 'religion', label: 'Religion' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'twitter', label: 'Twitter' },
    { key: 'linkedIn', label: 'LinkedIn' },
    { key: 'joiningSalary', label: 'Joining Salary', formatter: formatCurrency },
    { key: 'accountHolderName', label: 'Account Holder Name' },
    { key: 'accountNumber', label: 'Account Number' },
    { key: 'bankName', label: 'Bank Name' },
    { key: 'bankBranch', label: 'Bank Branch' },
    { key: 'schoolId', label: 'School ID' },
    { key: 'username', label: 'Username' },
    { key: 'lastLogin', label: 'Last Login', formatter: formatDate },
    { key: 'createdAt', label: 'Created At', formatter: formatDate },
    { key: 'updatedAt', label: 'Updated At', formatter: formatDate }
  ]
});

// Fee collection export configuration
export const getFeeCollectionExportConfig = (records: any[]): ExportConfig => ({
  filename: `fee_collection_export_${new Date().toISOString().split('T')[0]}`,
  title: 'Fee Collection Report',
  data: records,
  metadata: {
    totalRecords: records.length,
    generatedBy: 'School ERP System',
    additionalInfo: 'Complete fee collection data with payment details'
  },
  columns: [
    { key: 'paymentDate', label: 'Payment Date', formatter: formatDate },
    { key: 'admissionNumber', label: 'Admission Number' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'fatherName', label: 'Father Name' },
    { key: 'class', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'feeCategory', label: 'Fee Categories' },
    { key: 'totalFees', label: 'Total Fees', formatter: formatCurrency },
    { key: 'amountPaid', label: 'Amount Paid', formatter: formatCurrency },
    { key: 'feeAmount', label: 'Fee Amount', formatter: formatCurrency },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'receiptNumber', label: 'Receipt Number' },
    { key: 'status', label: 'Status' },
    { key: 'discountType', label: 'Discount Type' },
    { key: 'discountAmount', label: 'Discount Amount', formatter: formatCurrency },
    { key: 'amountAfterDiscount', label: 'Amount After Discount', formatter: formatCurrency }
  ]
});

// Generic table export configuration
export const getGenericTableExportConfig = (
  data: any[], 
  title: string, 
  columns: ExportColumn[]
): ExportConfig => ({
  filename: `${title.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}`,
  title,
  data,
  metadata: {
    totalRecords: data.length,
    generatedBy: 'School ERP System'
  },
  columns
}); 