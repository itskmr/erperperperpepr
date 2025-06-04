import React, { useRef } from 'react';
import { Printer } from 'lucide-react';
import { IssuedCertificate } from './types';
import { toast } from 'react-toastify';

interface TCViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: IssuedCertificate | null;
}

const TCViewModal: React.FC<TCViewModalProps> = ({ isOpen, onClose, certificate }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // Helper function to construct full image URL
  const getFullImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Construct full URL from relative path
    const baseUrl = window.location.origin.replace(':5173', ':5000'); // Frontend to backend port
    return `${baseUrl}/${imagePath}`;
  };

  const handlePrint = () => {
    if (!componentRef.current || !certificate) return;

    const logoUrl = getFullImageUrl(certificate.schoolDetails?.imageUrl);

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transfer Certificate - ${certificate.tcNo}</title>
          <style>
              body {
                  font-size: 12px;
                  font-family: 'Arial', sans-serif;
                  line-height: 1.4;
                  margin: 0;
                  padding: 15px;
                  background: white;
              }
              
              .tc-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                  border: 2px solid #1a237e;
                  border-radius: 8px;
              }
              
              .header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #1a237e;
                  padding-bottom: 15px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 20px;
              }
              
              .school-logo-container {
                  flex: 0 0 auto;
              }
              
              .school-logo {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 2px solid #1a237e;
              }
              
              .school-info {
                  flex: 1;
                  text-align: center;
              }
              
              .school-name {
                  font-size: 20px;
                  font-weight: bold;
                  color: #1a237e;
                  margin-bottom: 5px;
                  text-transform: uppercase;
              }
              
              .school-details {
                  font-size: 11px;
                  color: #555;
                  line-height: 1.3;
              }
              
              .form-title {
                  font-size: 16px;
                  font-weight: bold;
                  text-align: center;
                  text-transform: uppercase;
                  margin: 15px 0;
                  color: #1a237e;
              }
              
              .tc-info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 20px;
              }
              
              .info-row {
                  display: flex;
                  margin-bottom: 8px;
              }
              
              .label {
                  font-weight: bold;
                  min-width: 140px;
                  color: #333;
              }
              
              .value {
                  flex: 1;
                  border-bottom: 1px dotted #999;
                  padding-bottom: 2px;
              }
              
              .section-title {
                  font-weight: bold;
                  font-size: 13px;
                  margin: 20px 0 10px;
                  color: #1a237e;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
              }
              
              .two-column {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
              }
              
              @media print {
                  body {
                      margin: 0;
                      padding: 10px;
                      font-size: 11px;
                  }
                  
                  .tc-container {
                      box-shadow: none;
                      border-radius: 0;
                      max-width: none;
                      margin: 0;
                      padding: 15px;
                  }
                  
                  @page {
                      size: A4 portrait;
                      margin: 10mm;
                  }
              }
          </style>
      </head>
      <body>
          <div class="tc-container">
              <div class="header">
                  ${logoUrl ? `
                  <div class="school-logo-container">
                      <img src="${logoUrl}" alt="School Logo" class="school-logo" />
                  </div>
                  ` : ''}
                  <div class="school-info">
                      <div class="school-name">${certificate.schoolDetails?.schoolName || 'School Name'}</div>
                      <div class="school-details">
                          ${certificate.schoolDetails?.address || ''}<br>
                          Sr. Sec. Recognized Vide ID No. ${certificate.schoolDetails?.recognitionId || ''}, CBSE Affiliation No. ${certificate.schoolDetails?.affiliationNo || ''}<br>
                          Contact Nos.: ${certificate.schoolDetails?.contact || ''}, Email: ${certificate.schoolDetails?.email || ''}
                      </div>
                  </div>
              </div>
              
              <div class="form-title">Transfer Certificate</div>
              
              <div class="tc-info-grid">
                  <div class="info-row">
                      <span class="label">TC No:</span>
                      <span class="value">${certificate.tcNo || ''}</span>
                  </div>
                  <div class="info-row">
                      <span class="label">Admission No:</span>
                      <span class="value">${certificate.admissionNumber || ''}</span>
                  </div>
                  <div class="info-row">
                      <span class="label">Issue Date:</span>
                      <span class="value">${certificate.issueDate || ''}</span>
                  </div>
                  <div class="info-row">
                      <span class="label">Date of Admission:</span>
                      <span class="value">${certificate.dateOfAdmission || ''}</span>
                  </div>
              </div>
              
              <div class="section-title">Student Information</div>
              <div class="two-column">
                  <div>
                      <div class="info-row">
                          <span class="label">Name:</span>
                          <span class="value">${certificate.studentName || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Father's Name:</span>
                          <span class="value">${certificate.fatherName || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Mother's Name:</span>
                          <span class="value">${certificate.motherName || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Nationality:</span>
                          <span class="value">${certificate.nationality || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Category:</span>
                          <span class="value">${certificate.category || ''}</span>
                      </div>
                  </div>
                  <div>
                      <div class="info-row">
                          <span class="label">Date of Birth:</span>
                          <span class="value">${certificate.dateOfBirth || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Last Studied Class:</span>
                          <span class="value">${certificate.studentClass || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">School/Board Last Exam in:</span>
                          <span class="value">${certificate.examIn || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Whether Failed:</span>
                          <span class="value">${certificate.whetherFailed || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Fees Up To:</span>
                          <span class="value">${certificate.feesPaidUpTo || ''}</span>
                      </div>
                  </div>
              </div>
              
              <div class="section-title">Academic Details</div>
              <div class="two-column">
                  <div>
                      <div class="info-row">
                          <span class="label">Subjects Studied:</span>
                          <span class="value">${certificate.subject || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Qualified for Promotion:</span>
                          <span class="value">${certificate.qualified || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Total Working Days:</span>
                          <span class="value">${certificate.maxAttendance || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Total Present Days:</span>
                          <span class="value">${certificate.obtainedAttendance || ''}</span>
                      </div>
                  </div>
                  <div>
                      <div class="info-row">
                          <span class="label">Fees Concession Availed:</span>
                          <span class="value">${certificate.feesConcessionAvailed || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Games Played:</span>
                          <span class="value">${Array.isArray(certificate.gamesPlayed) ? certificate.gamesPlayed.join(', ') : certificate.gamesPlayed || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Extra-Curricular Activities:</span>
                          <span class="value">${Array.isArray(certificate.extraActivity) ? certificate.extraActivity.join(', ') : certificate.extraActivity || ''}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Date of Leaving:</span>
                          <span class="value">${certificate.dateOfLeaving || ''}</span>
                      </div>
                  </div>
              </div>
              
              <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                  <div style="text-align: center; width: 45%;">
                      <div style="height: 50px; border-bottom: 1px solid #333; margin-bottom: 5px;"></div>
                      <div style="font-weight: bold; font-size: 11px;">Class Teacher Signature</div>
                  </div>
                  <div style="text-align: center; width: 45%;">
                      <div style="height: 50px; border-bottom: 1px solid #333; margin-bottom: 5px;"></div>
                      <div style="font-weight: bold; font-size: 11px;">Principal Signature</div>
                  </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #666;">
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
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success("Certificate printed successfully!");
        }, 250);
      };
    } else {
      toast.error("Failed to open print window. Please check your browser settings.");
    }
  };

  if (!isOpen || !certificate) return null;

  const logoUrl = getFullImageUrl(certificate.schoolDetails?.imageUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Transfer Certificate</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="text-blue-600 hover:text-blue-700 p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
              title="Print Transfer Certificate"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div ref={componentRef}>
          {/* School Details Section */}
          <div className="text-center border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              {logoUrl && (
                <div className="mr-4">
                  <img 
                    src={logoUrl} 
                    alt="School Logo" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" 
                    onError={(e) => {
                      console.error('Logo failed to load:', logoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-bold uppercase text-blue-800">{certificate.schoolDetails?.schoolName || 'School Name'}</h3>
                <p className="text-gray-600 mt-1 text-xs">{certificate.schoolDetails?.address || ''}</p>
                <p className="text-gray-600 text-xs">Sr. Sec. Recognized Vide ID No. {certificate.schoolDetails?.recognitionId || ''}, CBSE Affiliation No. {certificate.schoolDetails?.affiliationNo || ''}</p>
                <p className="text-gray-600 text-xs">Contact Nos.: {certificate.schoolDetails?.contact || ''}, Email: {certificate.schoolDetails?.email || ''}</p>
              </div>
            </div>
          </div>
            
          <h1 className='text-lg font-bold uppercase text-center mb-4 text-blue-800'>Transfer Certificate</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-black font-bold text-sm">TC No:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.tcNo || ''}</p>
            </div>
            <div>
              <span className="text-black font-bold text-sm">Admission No:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.admissionNumber || ''}</p>
            </div>
            <div>
              <span className="text-black font-bold text-sm">Issue Date:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.issueDate || ''}</p>
            </div>
            <div>
              <span className="text-black font-bold text-sm">Date of Admission:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.dateOfAdmission || ''}</p>
            </div>
          </div>

          <h4 className="font-medium mb-3 text-blue-800 border-b border-gray-200 pb-2">Student Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-black text-sm font-bold">Name:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.studentName || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Father's Name:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.fatherName || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Mother's Name:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.motherName || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Nationality:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.nationality || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Category:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.category || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Date of Birth:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.dateOfBirth || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Last Studied Class:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.studentClass || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">School/Board Last Exam in:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.examIn || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Whether Failed:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.whetherFailed || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Fees Up To:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.feesPaidUpTo || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Subjects Studied:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.subject || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Qualified for Promotion:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.qualified || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Total Working Days:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.maxAttendance || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Total Present Days:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.obtainedAttendance || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Fees Concession Availed:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.feesConcessionAvailed || ''}</p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Games Played:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">
                {Array.isArray(certificate.gamesPlayed) ? certificate.gamesPlayed.join(', ') : certificate.gamesPlayed || ''}
              </p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Extra-Curricular Activities:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">
                {Array.isArray(certificate.extraActivity) ? certificate.extraActivity.join(', ') : certificate.extraActivity || ''}
              </p>
            </div>
            <div>
              <span className="text-black text-sm font-bold">Date of Leaving:</span>
              <p className="font-light border-b border-dotted border-gray-400 pb-1">{certificate.dateOfLeaving || ''}</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
            <div className="text-center">
              <div className="h-12 border-b border-black mb-2"></div>
              <p className="text-sm font-bold">Class Teacher</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b border-black mb-2"></div>
              <p className="text-sm font-bold">Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCViewModal;

