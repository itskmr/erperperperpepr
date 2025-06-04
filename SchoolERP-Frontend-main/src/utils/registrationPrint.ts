import { fetchSchoolInfo, generateSchoolHeader, getHeaderStyles } from './schoolHeader';

interface StudentRegistrationForPrint {
  formNo?: string;
  fullName?: string;
  regnDate?: string;
  registerForClass?: string;
  testDate?: string;
  branchName?: string;
  gender?: string;
  dob?: string;
  category?: string;
  religion?: string;
  admissionCategory?: string;
  bloodGroup?: string;
  transactionNo?: string;
  singleParent?: boolean;
  contactNo?: string;
  studentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  studentAadharCardNo?: string;
  regnCharge?: string;
  examSubject?: string;
  paymentStatus?: string;
  fatherName?: string;
  fatherMobileNo?: string;
  smsAlert?: boolean;
  fatherEmail?: string;
  fatherAadharCardNo?: string;
  isFatherCampusEmployee?: boolean;
  motherName?: string;
  motherMobileNo?: string;
  motherAadharCardNo?: string;
}

interface SchoolInfo {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export const generateRegistrationFormPrint = async (studentData: StudentRegistrationForPrint): Promise<void> => {
  // Fetch school info using shared utility
  const schoolInfo = await fetchSchoolInfo();

  const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${schoolInfo.schoolName} - Student Registration Details</title>
        <style>
            body {
                font-size: 11px;
                font-family: 'Arial', sans-serif;
                line-height: 1.3;
                margin: 0;
                padding: 12px;
                background: #f8f9fa;
            }
            
            .registration-form-container {
                max-width: 210mm;
                margin: 0 auto;
                background: white;
                padding: 18px;
                box-shadow: 0 0 15px rgba(0,0,0,0.1);
                border: 2px solid #1a237e;
                border-radius: 8px;
                position: relative;
            }
            
            /* Decorative corner elements */
            .registration-form-container::before,
            .registration-form-container::after {
                content: '';
                position: absolute;
                width: 25px;
                height: 25px;
                border: 2px solid #d32f2f;
            }
            
            .registration-form-container::before {
                top: 8px;
                left: 8px;
                border-right: none;
                border-bottom: none;
            }
            
            .registration-form-container::after {
                bottom: 8px;
                right: 8px;
                border-left: none;
                border-top: none;
            }
            
            ${getHeaderStyles()}
            
            .section-title {
                font-size: 11px;
                font-weight: bold;
                margin: 12px 0 8px;
                padding: 5px 10px;
                background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);
                color: white;
                border-radius: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 1px 3px rgba(211, 47, 47, 0.3);
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 12px;
                background: white;
            }
            
            .label {
                font-weight: bold;
                padding: 8px 10px;
                background: #f5f5f5;
                border: 1px solid #ddd;
                color: #333;
                font-size: 10px;
                width: 30%;
                vertical-align: middle;
            }
            
            .field {
                padding: 8px 10px;
                border: 1px solid #ddd;
                font-size: 11px;
                color: #444;
                border-bottom: 1px dotted #999;
                min-height: 20px;
                vertical-align: middle;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-paid {
                background: #e8f5e8;
                color: #2e7d32;
                border: 1px solid #4caf50;
            }
            
            .status-pending {
                background: #fff3e0;
                color: #f57c00;
                border: 1px solid #ff9800;
            }
            
            .status-unpaid {
                background: #ffebee;
                color: #d32f2f;
                border: 1px solid #f44336;
            }
            
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #1a237e;
                display: flex;
                justify-content: space-between;
                align-items: end;
            }
            
            .signature-section {
                text-align: center;
                width: 45%;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                height: 40px;
                margin-bottom: 5px;
            }
            
            .signature-label {
                font-size: 10px;
                font-weight: bold;
                color: #666;
            }
            
            .print-date {
                position: absolute;
                bottom: 10px;
                right: 15px;
                font-size: 8px;
                color: #888;
            }
            
            /* Print-specific styles */
            @media print {
                body {
                    background: white;
                    padding: 0;
                    margin: 0;
                    font-size: 10px;
                }
                
                .registration-form-container {
                    box-shadow: none;
                    max-width: none;
                    margin: 0;
                    border-radius: 0;
                    border: 2px solid #1a237e;
                    padding: 12px;
                }
                
                @page {
                    size: A4 portrait;
                    margin: 8mm;
                }
                
                /* Ensure colors print correctly */
                .form-title,
                .section-title,
                .status-badge {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                
                /* Prevent orphaned content */
                .section-title {
                    page-break-after: avoid;
                }
                
                table {
                    page-break-inside: avoid;
                    margin-bottom: 6px;
                }
            }
        </style>
    </head>
    <body>
        <div class="registration-form-container">
            ${generateSchoolHeader(schoolInfo, 'Student Registration Details')}
            
            <!-- Registration Summary -->
            <div class="section-title">Registration Summary</div>
            <table>
                <tr>
                    <td class="label">Form Number:</td>
                    <td class="field">${studentData.formNo || 'N/A'}</td>
                    <td class="label">Registration Date:</td>
                    <td class="field">${studentData.regnDate ? new Date(studentData.regnDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Register For Class:</td>
                    <td class="field">${studentData.registerForClass || 'N/A'}</td>
                    <td class="label">Payment Status:</td>
                    <td class="field">
                        <span class="status-badge ${
                          studentData.paymentStatus === 'Paid' ? 'status-paid' : 
                          studentData.paymentStatus === 'Pending' ? 'status-pending' : 'status-unpaid'
                        }">${studentData.paymentStatus || 'Pending'}</span>
                    </td>
                </tr>
                <tr>
                    <td class="label">Test Date:</td>
                    <td class="field">${studentData.testDate ? new Date(studentData.testDate).toLocaleDateString() : 'N/A'}</td>
                    <td class="label">Branch:</td>
                    <td class="field">${studentData.branchName || 'N/A'}</td>
                </tr>
            </table>
            
            <!-- Student Information -->
            <div class="section-title">Student Information</div>
            <table>
                <tr>
                    <td class="label">Full Name:</td>
                    <td class="field">${studentData.fullName || 'N/A'}</td>
                    <td class="label">Gender:</td>
                    <td class="field">${studentData.gender || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Date of Birth:</td>
                    <td class="field">${studentData.dob ? new Date(studentData.dob).toLocaleDateString() : 'N/A'}</td>
                    <td class="label">Blood Group:</td>
                    <td class="field">${studentData.bloodGroup || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Category:</td>
                    <td class="field">${studentData.category || 'N/A'}</td>
                    <td class="label">Religion:</td>
                    <td class="field">${studentData.religion || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Admission Category:</td>
                    <td class="field">${studentData.admissionCategory || 'N/A'}</td>
                    <td class="label">Single Parent:</td>
                    <td class="field">${studentData.singleParent ? 'Yes' : 'No'}</td>
                </tr>
            </table>
            
            <!-- Contact Information -->
            <div class="section-title">Contact Information</div>
            <table>
                <tr>
                    <td class="label">Contact Number:</td>
                    <td class="field">${studentData.contactNo || 'N/A'}</td>
                    <td class="label">Email:</td>
                    <td class="field">${studentData.studentEmail || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Address:</td>
                    <td class="field" colspan="3">${studentData.address || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">City:</td>
                    <td class="field">${studentData.city || 'N/A'}</td>
                    <td class="label">State:</td>
                    <td class="field">${studentData.state || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Pincode:</td>
                    <td class="field">${studentData.pincode || 'N/A'}</td>
                    <td class="label">Aadhaar Number:</td>
                    <td class="field">${studentData.studentAadharCardNo || 'N/A'}</td>
                </tr>
            </table>
            
            <!-- Parent Information -->
            <div class="section-title">Parent Information</div>
            <table>
                <tr>
                    <td class="label">Father's Name:</td>
                    <td class="field">${studentData.fatherName || 'N/A'}</td>
                    <td class="label">Father's Mobile:</td>
                    <td class="field">${studentData.fatherMobileNo || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Father's Email:</td>
                    <td class="field">${studentData.fatherEmail || 'N/A'}</td>
                    <td class="label">Father's Aadhaar:</td>
                    <td class="field">${studentData.fatherAadharCardNo || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Campus Employee:</td>
                    <td class="field">${studentData.isFatherCampusEmployee ? 'Yes' : 'No'}</td>
                    <td class="label">SMS Alert:</td>
                    <td class="field">${studentData.smsAlert ? 'Enabled' : 'Disabled'}</td>
                </tr>
                <tr>
                    <td class="label">Mother's Name:</td>
                    <td class="field">${studentData.motherName || 'N/A'}</td>
                    <td class="label">Mother's Mobile:</td>
                    <td class="field">${studentData.motherMobileNo || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Mother's Aadhaar:</td>
                    <td class="field" colspan="3">${studentData.motherAadharCardNo || 'N/A'}</td>
                </tr>
            </table>
            
            <!-- Financial Information -->
            <div class="section-title">Financial Information</div>
            <table>
                <tr>
                    <td class="label">Transaction Number:</td>
                    <td class="field">${studentData.transactionNo || 'N/A'}</td>
                    <td class="label">Registration Charge:</td>
                    <td class="field">${studentData.regnCharge ? '₹' + studentData.regnCharge : 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Exam Subject:</td>
                    <td class="field" colspan="3">${studentData.examSubject || 'N/A'}</td>
                </tr>
            </table>
            
            <!-- Footer -->
            <div class="footer">
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Registrar Signature</div>
                </div>
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Parent/Guardian Signature</div>
                </div>
            </div>
            
            <div class="print-date">
                Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
        </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  } else {
    console.error('Could not open print window');
  }
}; 