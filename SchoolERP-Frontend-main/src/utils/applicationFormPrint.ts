import { fetchSchoolInfo, generateSchoolHeader, getHeaderStyles } from './schoolHeader';

interface ApplicationFormData {
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

export const generateApplicationFormPrint = async (studentData: ApplicationFormData): Promise<void> => {
  // Fetch school info using shared utility
  const schoolInfo = await fetchSchoolInfo();

  const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${schoolInfo.schoolName} - Application Form</title>
        <style>
            body {
                font-size: 11px;
                font-family: 'Arial', sans-serif;
                line-height: 1.2;
                margin: 0;
                padding: 12px;
                background: #f8f9fa;
            }
            
            .application-form-container {
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
            .application-form-container::before,
            .application-form-container::after {
                content: '';
                position: absolute;
                width: 25px;
                height: 25px;
                border: 2px solid #d32f2f;
            }
            
            .application-form-container::before {
                top: 8px;
                left: 8px;
                border-right: none;
                border-bottom: none;
            }
            
            .application-form-container::after {
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
            
            .photo-box {
                width: 120px;
                height: 150px;
                border: 2px solid #1a237e;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f9f9f9;
                border-radius: 3px;
                font-size: 9px;
                color: #666;
                text-align: center;
            }
            
            .declaration {
                border: 1px solid #1a237e;
                padding: 12px;
                margin: 20px 0;
                background: #f8f9fa;
                border-radius: 4px;
                font-size: 10px;
                text-align: justify;
                line-height: 1.4;
            }
            
            .signature-section {
                text-align: center;
                width: 45%;
                margin: 20px 0;
            }
            
            .signature-line {
                border-bottom: 2px solid #333;
                height: 40px;
                margin-bottom: 8px;
            }
            
            .signature-label {
                font-size: 10px;
                font-weight: bold;
                color: #666;
            }
            
            /* Print-specific styles */
            @media print {
                body {
                    background: white;
                    padding: 0;
                    margin: 0;
                    font-size: 10px;
                }
                
                .application-form-container {
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
        <div class="application-form-container">
            ${generateSchoolHeader(schoolInfo, 'Student Application Form')}
            
            <!-- Application Header -->
            <table style="margin-bottom: 15px;">
                <tr>
                    <td class="label">Application Form No.:</td>
                    <td class="field" style="width: 20%;">${studentData.formNo || ''}</td>
                    <td class="label">Application Date:</td>
                    <td class="field" style="width: 20%;">${studentData.regnDate ? new Date(studentData.regnDate).toLocaleDateString() : ''}</td>
                    <td rowspan="3" style="width: 20%; text-align: center; vertical-align: top; padding: 10px;">
                        <div class="photo-box">
                            Affix passport<br>size photo of the<br>student
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="label">Class Applied For:</td>
                    <td class="field">${studentData.registerForClass || ''}</td>
                    <td class="label">Branch:</td>
                    <td class="field">${studentData.branchName || ''}</td>
                </tr>
                <tr>
                    <td class="label">Test Date:</td>
                    <td class="field">${studentData.testDate ? new Date(studentData.testDate).toLocaleDateString() : ''}</td>
                    <td class="label">Status:</td>
                    <td class="field">
                        <span class="status-badge ${
                          studentData.paymentStatus === 'Paid' ? 'status-paid' : 
                          studentData.paymentStatus === 'Pending' ? 'status-pending' : 'status-unpaid'
                        }">${studentData.paymentStatus || 'Pending'}</span>
                    </td>
                </tr>
            </table>
            
            <!-- Student Information -->
            <div class="section-title">Student Information</div>
            <table>
                <tr>
                    <td class="label">Full Name (in block letters):</td>
                    <td class="field" colspan="3">${(studentData.fullName || '').toUpperCase()}</td>
                </tr>
                <tr>
                    <td class="label">Date of Birth:</td>
                    <td class="field">${studentData.dob ? new Date(studentData.dob).toLocaleDateString() : ''}</td>
                    <td class="label">Gender:</td>
                    <td class="field">${studentData.gender || ''}</td>
                </tr>
                <tr>
                    <td class="label">Category:</td>
                    <td class="field">${studentData.category || ''}</td>
                    <td class="label">Religion:</td>
                    <td class="field">${studentData.religion || ''}</td>
                </tr>
                <tr>
                    <td class="label">Blood Group:</td>
                    <td class="field">${studentData.bloodGroup || ''}</td>
                    <td class="label">Admission Category:</td>
                    <td class="field">${studentData.admissionCategory || ''}</td>
                </tr>
                <tr>
                    <td class="label">Contact Number:</td>
                    <td class="field">${studentData.contactNo || ''}</td>
                    <td class="label">Email:</td>
                    <td class="field">${studentData.studentEmail || ''}</td>
                </tr>
                <tr>
                    <td class="label">Aadhaar Number:</td>
                    <td class="field" colspan="3">${studentData.studentAadharCardNo || ''}</td>
                </tr>
                <tr>
                    <td class="label">Single Parent:</td>
                    <td class="field">${studentData.singleParent ? 'Yes' : 'No'}</td>
                    <td class="label">SMS Alerts:</td>
                    <td class="field">${studentData.smsAlert ? 'Enabled' : 'Disabled'}</td>
                </tr>
            </table>
            
            <!-- Address Information -->
            <div class="section-title">Address Information</div>
            <table>
                <tr>
                    <td class="label">Complete Address:</td>
                    <td class="field" colspan="3">${studentData.address || ''}</td>
                </tr>
                <tr>
                    <td class="label">City:</td>
                    <td class="field">${studentData.city || ''}</td>
                    <td class="label">State:</td>
                    <td class="field">${studentData.state || ''}</td>
                </tr>
                <tr>
                    <td class="label">Pincode:</td>
                    <td class="field" colspan="3">${studentData.pincode || ''}</td>
                </tr>
            </table>
            
            <!-- Father's Information -->
            <div class="section-title">Father's Information</div>
            <table>
                <tr>
                    <td class="label">Father's Name:</td>
                    <td class="field" colspan="3">${studentData.fatherName || ''}</td>
                </tr>
                <tr>
                    <td class="label">Mobile Number:</td>
                    <td class="field">${studentData.fatherMobileNo || ''}</td>
                    <td class="label">Email:</td>
                    <td class="field">${studentData.fatherEmail || ''}</td>
                </tr>
                <tr>
                    <td class="label">Aadhaar Number:</td>
                    <td class="field">${studentData.fatherAadharCardNo || ''}</td>
                    <td class="label">Campus Employee:</td>
                    <td class="field">${studentData.isFatherCampusEmployee ? 'Yes' : 'No'}</td>
                </tr>
            </table>
            
            <!-- Mother's Information -->
            <div class="section-title">Mother's Information</div>
            <table>
                <tr>
                    <td class="label">Mother's Name:</td>
                    <td class="field" colspan="3">${studentData.motherName || ''}</td>
                </tr>
                <tr>
                    <td class="label">Mobile Number:</td>
                    <td class="field">${studentData.motherMobileNo || ''}</td>
                    <td class="label">Aadhaar Number:</td>
                    <td class="field">${studentData.motherAadharCardNo || ''}</td>
                </tr>
            </table>
            
            <!-- Financial Information -->
            <div class="section-title">Registration & Fee Details</div>
            <table>
                <tr>
                    <td class="label">Registration Charge:</td>
                    <td class="field">${studentData.regnCharge ? '₹' + studentData.regnCharge : 'N/A'}</td>
                    <td class="label">Transaction No.:</td>
                    <td class="field">${studentData.transactionNo || ''}</td>
                </tr>
                <tr>
                    <td class="label">Exam Subject:</td>
                    <td class="field" colspan="3">${studentData.examSubject || ''}</td>
                </tr>
            </table>
            
            <!-- Declaration -->
            <div class="declaration">
                <strong>Declaration:</strong><br>
                I hereby declare that the above information furnished by me is correct to the best of my knowledge and belief. 
                I understand that any false information provided may lead to cancellation of admission. I agree to abide by the 
                rules and regulations of the school and will cooperate with the school administration in all academic and 
                non-academic activities.
            </div>
            
            <!-- Signatures -->
            <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 30px;">
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Father's Signature</div>
                </div>
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Mother's Signature</div>
                </div>
            </div>
            
            <!-- For Office Use Only -->
            <div style="margin-top: 30px; border-top: 2px solid #1a237e; padding-top: 15px;">
                <div class="section-title">For Office Use Only</div>
                <table>
                    <tr>
                        <td class="label">Received By:</td>
                        <td class="field"></td>
                        <td class="label">Verified By:</td>
                        <td class="field"></td>
                    </tr>
                    <tr>
                        <td class="label">Test Score:</td>
                        <td class="field"></td>
                        <td class="label">Interview Score:</td>
                        <td class="field"></td>
                    </tr>
                    <tr>
                        <td class="label">Admission Status:</td>
                        <td class="field"></td>
                        <td class="label">Date:</td>
                        <td class="field"></td>
                    </tr>
                </table>
                
                <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 20px;">
                    <div style="text-align: center; width: 30%;">
                        <div style="border-bottom: 1px solid #333; height: 30px; margin-bottom: 5px;"></div>
                        <div style="font-size: 9px; font-weight: bold;">Admission Officer</div>
                    </div>
                    <div style="text-align: center; width: 30%;">
                        <div style="border-bottom: 1px solid #333; height: 30px; margin-bottom: 5px;"></div>
                        <div style="font-size: 9px; font-weight: bold;">Academic Coordinator</div>
                    </div>
                    <div style="text-align: center; width: 30%;">
                        <div style="border-bottom: 1px solid #333; height: 30px; margin-bottom: 5px;"></div>
                        <div style="font-size: 9px; font-weight: bold;">Principal's Approval</div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 8px; color: #666;">
                <p>Application generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>Please submit this form along with required documents at the time of admission.</p>
            </div>
        </div>
        
        <script>
            // Auto print when page loads
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      // Don't close automatically to allow user to review
    };
  } else {
    alert('Please allow popups for printing');
  }
}; 