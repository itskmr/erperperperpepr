import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaDownload, FaFileAlt, FaImage, FaCheck, FaExclamationTriangle, FaPrint, FaFile } from 'react-icons/fa';
import { generateJPAdmissionFormPrint } from '../../utils/jpAdmissionPrint';
import { DocumentStatus, DocumentPaths } from '../StudentForm/StudentFormTypes';

interface StudentDocument {
  type: string;
  name: string;
  filePath: string | null;
  hasFile: boolean;
  url: string | null;
}

interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  gender: string;
  category: string;
  apaarId: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  presentAddress: string;
  permanentAddress: string;
  sameAsPresentAddress: boolean;
  bloodGroup: string;
  religion: string;
  nationality: string;
  lastSchool: string;
  tcNumber: string;
  tcDate: string;
  admissionDate: string;
  sessionInfo: {
    currentClass: string;
    currentSection: string;
    rollNumber: string;
    stream: string;
    medium: string;
  };
  // Updated document structure
  documentPaths?: DocumentPaths;
  documentStatus?: DocumentStatus;
}

interface StudentViewProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, isOpen, onClose }) => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student?.id) {
      fetchStudentDocuments();
    }
  }, [isOpen, student?.id]);

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${student.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.documents || []);
          setDocumentStatus(data.documentStatus || {});
        } else {
          console.error('Failed to fetch documents:', data.message);
        }
      } else {
        console.error('Failed to fetch documents:', response.status);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getDocumentIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) return <FaFileAlt className="text-red-500" />;
    if (lowerType.includes('image') || lowerType.includes('photo') || lowerType.includes('signature')) {
      return <FaImage className="text-blue-500" />;
    }
    return <FaFile className="text-gray-500" />;
  };

  const handleDownload = async (doc: StudentDocument) => {
    if (!doc.url) return;
    
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.admissionNo}-${doc.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleView = (doc: StudentDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Path', '')
      .trim();
  };

  const getDocumentStatusIcon = (verified: boolean) => {
    return verified ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        ⏳ Pending
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateJPAdmissionFormPrint(student)}
              className="text-gray-500 hover:text-gray-700"
              title="Print Admission Form"
            >
              <FaPrint />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">Admission No</label>
                <p className="mt-1">{student.admissionNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Admission Date</label>
                <p className="mt-1">{new Date(student.admissionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1">{student.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="mt-1">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="mt-1">{student.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                <p className="mt-1">{student.bloodGroup}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Religion</label>
                <p className="mt-1">{student.religion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nationality</label>
                <p className="mt-1">{student.nationality}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Category</label>
                <p className="mt-1">{student.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">APAAR ID</label>
                <p className="mt-1">{student.apaarId || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                <p className="mt-1">{student.aadhaarNumber || 'Not provided'}</p>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">Class & Section</label>
                <p className="mt-1">{student.sessionInfo.currentClass} - {student.sessionInfo.currentSection}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                <p className="mt-1">{student.sessionInfo.rollNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Stream</label>
                <p className="mt-1">{student.sessionInfo.stream}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Medium</label>
                <p className="mt-1">{student.sessionInfo.medium}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Last School</label>
                <p className="mt-1">{student.lastSchool}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">TC Number</label>
                <p className="mt-1">{student.tcNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">TC Date</label>
                <p className="mt-1">{student.tcDate ? new Date(student.tcDate).toLocaleDateString() : ''}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                <p className="mt-1">{student.mobileNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{student.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Present Address</label>
                <p className="mt-1">{student.presentAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Permanent Address</label>
                <p className="mt-1">{student.sameAsPresentAddress ? 'Same as Present Address' : student.permanentAddress}</p>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">Father's Name</label>
                <p className="mt-1">{student.fatherName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mother's Name</label>
                <p className="mt-1">{student.motherName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian Name</label>
                <p className="mt-1">{student.guardianName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian Relation</label>
                <p className="mt-1">{student.guardianRelation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian Mobile</label>
                <p className="mt-1">{student.guardianMobile}</p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Documents</h3>
              <div className="flex items-center space-x-2">
                {documentStatus.documentsVerified && getDocumentStatusIcon(true)}
                <span className="text-sm text-gray-600">
                  {documents.length} document(s) uploaded
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <h4 className="font-medium text-sm">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{formatFieldName(doc.type)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="View Document"
                        >
                          <FaEye />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Download Document"
                        >
                          <FaDownload />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaFile className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No documents uploaded</p>
              </div>
            )}

            {/* Document Status Summary */}
            {documentStatus && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Document Verification Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Birth Certificate:</span>
                    {getDocumentStatusIcon(documentStatus.birthCertificateSubmitted || false)}
                  </div>
                  <div className="flex justify-between">
                    <span>Student Aadhaar:</span>
                    {getDocumentStatusIcon(documentStatus.studentAadharSubmitted || false)}
                  </div>
                  <div className="flex justify-between">
                    <span>Father Aadhaar:</span>
                    {getDocumentStatusIcon(documentStatus.fatherAadharSubmitted || false)}
                  </div>
                  <div className="flex justify-between">
                    <span>Mother Aadhaar:</span>
                    {getDocumentStatusIcon(documentStatus.motherAadharSubmitted || false)}
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Certificate:</span>
                    {getDocumentStatusIcon(documentStatus.tcSubmitted || false)}
                  </div>
                  <div className="flex justify-between">
                    <span>Mark Sheet:</span>
                    {getDocumentStatusIcon(documentStatus.marksheetSubmitted || false)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView; 