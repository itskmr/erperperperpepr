import React from 'react';
import { FaTimes, FaDownload, FaFilePdf, FaFileImage, FaFile } from 'react-icons/fa';

interface StudentDocument {
  id: string;
  name: string;
  type: string;
  url: string;
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
  documents: StudentDocument[];
  sessionInfo: {
    currentClass: string;
    currentSection: string;
    rollNumber: string;
    stream: string;
    medium: string;
  };
}

interface StudentViewProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('image')) return <FaFileImage className="text-blue-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const handleDownload = async (doc: StudentDocument) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleView = (doc: StudentDocument) => {
    window.open(doc.url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-sm font-medium text-gray-600">Guardian's Name</label>
                <p className="mt-1">{student.guardianName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian's Relation</label>
                <p className="mt-1">{student.guardianRelation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian's Mobile</label>
                <p className="mt-1">{student.guardianMobile}</p>
              </div>
            </div>

            {/* ID Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">ID Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">APAAR ID</label>
                <p className="mt-1">{student.apaarId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                <p className="mt-1">{student.aadhaarNumber}</p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Documents</h3>
              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(doc.type)}
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-2 text-blue-500 hover:text-blue-600"
                          title="View"
                        >
                          <FaFilePdf size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-green-500 hover:text-green-600"
                          title="Download"
                        >
                          <FaDownload size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView; 