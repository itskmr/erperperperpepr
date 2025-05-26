import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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

  const handlePrint = useReactToPrint({
    body: () => componentRef.current,
    documentTitle: "Transfer_Certificate",
    onAfterPrint: () => toast.success("Certificate printed successfully!"),
    onPrintError: () => toast.error("Failed to print the certificate. Please try again."),
  });

  if (!isOpen || !certificate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Transfer Certificate</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Certificate Content */}
        <div ref={componentRef} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          {/* School Details Section */}
          <div className="text-center flex mb-2">
          <div className="">
              {certificate.schoolDetails.imageUrl && (
                <img src={certificate.schoolDetails.imageUrl} alt="School Logo" className="w-20 h-20 rounded-full mx-auto mb-2" />
              )}
            </div>
            <div className="">
            <h3 className="text-xl font-bold uppercase">{certificate.schoolDetails.schoolName}</h3>
            <p className="text-gray-600 mt-1 text-xs">{certificate.schoolDetails.address}</p>
            <p className="text-gray-600 text-xs">Sr. Sec. Recognized Vide ID No. {certificate.schoolDetails.recognitionId}, CBSE Affiliation No. {certificate.schoolDetails.affiliationNo}</p>
            <p className="text-gray-600 text-xs">Contact Nos.: {certificate.schoolDetails.contact}, Email: {certificate.schoolDetails.email}</p>
          </div>
          </div>
            <hr />
          <div className="space-y-2 mt-2">
            <h1 className='text-l font-bold uppercase text-center'>Transfer Certicate</h1>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-black font-bold text-sm">TC No:</span>
                <p className="font-light">{certificate.tcNo}</p>
              </div>
              <div>
                <span className="text-black font-bold text-sm">Admission No:</span>
                <p className="font-light">{certificate.admissionNumber}</p>
              </div>
              <div>
                <span className="text-black font-bold text-sm">Issue Date:</span>
                <p className="font-light">{certificate.issueDate}</p>
              </div>
              <div>
                <span className="text-black font-bold text-sm">Date of Admission:</span>
                <p className="font-light">{certificate.dateOfAdmission}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-black text-sm font-bold">Name:</span>
                  <p className="font-light">{certificate.studentName}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Father's Name:</span>
                  <p className="font-light">{certificate.fatherName}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Mother's Name:</span>
                  <p className="font-light">{certificate.motherName}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Nationality:</span>
                  <p className="font-light">{certificate.nationality}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Category:</span>
                  <p className="font-light">{certificate.category}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Date of Birth:</span>
                  <p className="font-light">{certificate.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Last Studied Class:</span>
                  <p className="font-light">{certificate.studentClass}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">School/Board Last Exam in:</span>
                  <p className="font-light">{certificate.examIn}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Whether Failed:</span>
                  <p className="font-light">{certificate.whetherFailed}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Fees Up To:</span>
                  <p className="font-light">{certificate.feesPaidUpTo}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Subjects Studied:</span>
                  <p className="font-light">{certificate.subject}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Qualified for Promotion:</span>
                  <p className="font-light">{certificate.qualified}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Total Working Days:</span>
                  <p className="font-light">{certificate.maxAttendance}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Total Present Days:</span>
                  <p className="font-light">{certificate.obtainedAttendance}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Fees Concession Availed:</span>
                  <p className="font-light">{certificate.feesConcessionAvailed}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Games Played:</span>
                  <p className="font-light">{certificate.gamesPlayed}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Extra-Curricular Activities:</span>
                  <p className="font-light">{certificate.extraActivity}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">General Conduct:</span>
                  <p className="font-light">{certificate.generalConduct}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Date of Leaving:</span>
                  <p className="font-light">{certificate.dateOfLeaving}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Reason for Leaving:</span>
                  <p className="font-light">{certificate.reason}</p>
                </div>
                <div>
                  <span className="text-black text-sm font-bold">Remarks:</span>
                  <p className="font-light">{certificate.remarks}</p>
                </div>
              </div>
            </div>
          </div>
        
          <div className='border-t border-gray-200 pt-10 mt-4'>
            <div className="flex justify-between"> 
              <h4 className="font-medium">Class Teacher</h4>
              <h4 className="font-medium">Checked By</h4>
              <h4 className="font-medium">Principal's Signature</h4>
            </div>
            <div className='pt-10'>
              <h4 className="font-medium">Counter Sign By Education Officer</h4>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-2"
          >
            <Printer className="h-5 w-5 inline-block" /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default TCViewModal;

