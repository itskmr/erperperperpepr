import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { StudentDetails, IssuedCertificate } from './types';
import { fetchStudentData, createCertificate, updateCertificate } from './data';
import { MultiSelectInput } from './MultipleSelectInput';
// Enums for select options
const QualifiedStatus = {
  Yes: 'Yes',
  No: 'No',
  NA: 'NA',
  Pass: 'Pass',
  Fail: 'Fail',
  Compartment: 'Compartment',
  AsperCBSEBoardResult: 'As per CBSE Board Result',
  AppearedinclassXExam: 'Appeared in class X Exam',
  AppearedinclassXIIExam: 'Appeared in class XII Exam',
};

const ReasonForLeaving = {
  FamilyRelocation: 'Family Relocation',
  AdmissionInOtherSchool: 'Admission in Other School',
  Duetolongabsencewithoutinformation: 'Due to long absence without information',
  FatherJobTransfer: 'Father Job Transfer',
  GetAdmissioninHigherClass: 'Get Admission in Higher Class',
  GoingtoNativePlace: 'Going to Native Place',
  ParentWill: 'Parent Will',
  Passedoutfromtheschool: 'Passed out from the school',
  Shiftingtootherplace: 'Shifting to other place',
  TransferCase: 'Transfer Case',
  Other: 'Other',
};

const ConductStatus = {
  Excellent: 'Excellent',
  Good: 'Good',
  Satisfactory: 'Satisfactory',
  NeedsImprovement: 'Needs Improvement',
  Poor: 'Poor',
};

const FeeConcessionStatus = {
  None: 'None',
  Partial: 'Partial',
  Full: 'Full',
};

const ExamAppearedIn = {
  School: 'School',
  Board: 'Board',
  NA: 'NA',
  CBSEBoard: 'CBSE Board',
  SchoolFailed: 'School Failed',
  SchoolPassed: 'School Passed',
  SchoolCompartment: 'School Compartment',
  BoardPassed: 'Board Passed',
  BoardFailed: 'Board Failed',
  BoardCompartment: 'Board Compartment',
};

const WhetherFailed = {
  Yes: 'Yes',
  No: 'No',
  NA: 'NA',
  CBSEBoard: 'CBSE Board',
};

const GamesPlayed = [
  'Football',
  'Cricket',
  'Basketball',
  'Volleyball',
  'Badminton',
  'Athletics',
  'Chess',
  'Swimming',
  'Kabaddi',
];

const ExtraActivities = [
  'Participate In Stage Show',
  'Participate In Sports',
  'Participate In Debate',
  'Participate In Quiz',
  'Participate In Painting',
  'Participate In Singing',
  'Participate In Dancing',
  'Participate In Other',
];
interface TCFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  certificate: IssuedCertificate | null;
  setIssuedCertificates: React.Dispatch<React.SetStateAction<IssuedCertificate[]>>;
}


const TCFormModal: React.FC<TCFormModalProps> = ({
  isOpen,
  onClose,
  isEdit,
  certificate,
  setIssuedCertificates
}) => {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IssuedCertificate>({
    studentName: '',
    studentClass: '',
    admissionNumber: '',
    motherName: '',
    fatherName: '',
    nationality: '',
    category: '',
    dateOfBirth: '',
    issueDate: new Date().toISOString().split('T')[0],
    leavingDate: new Date().toISOString().split('T')[0],
    reason: '',
    examIn: '',
    qualified: '',
    gamesPlayed: [],
    extraActivity: [],
    tcNo: '',
    subject: '',
    generalConduct: '',
    dateOfLeaving: new Date().toISOString().split('T')[0],
    remarks: '',
    maxAttendance: '',
    obtainedAttendance: '',
    lastAttendanceDate: new Date().toISOString().split('T')[0],
    whetherFailed: '',
    tcCharge: '',
    toClass: '',
    classInWords: '',
    behaviorRemarks: '',
    rollNo: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    admitClass: '',
    feesPaidUpTo: '',
    feesConcessionAvailed: '',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    schoolDetails: {
      schoolName: '',
      address: '',
      recognitionId: '',
      affiliationNo: '',
      contact: '',
      email: '',
      website: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isEdit && certificate) {
      setFormData(certificate);
      setAdmissionNumber(certificate.admissionNumber);
    } else {
      resetForm();
    }
  }, [isEdit, certificate]);

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentClass: '',
      admissionNumber: '',
      motherName: '',
      fatherName: '',
      nationality: '',
      category: '',
      dateOfBirth: '',
      issueDate: new Date().toISOString().split('T')[0],
      leavingDate: new Date().toISOString().split('T')[0],
      reason: '',
      examIn: '',
      qualified: '',
      gamesPlayed: [],
      extraActivity: [],
      tcNo: '',
      subject: '',
      generalConduct: '',
      dateOfLeaving: new Date().toISOString().split('T')[0],
      remarks: '',
      maxAttendance: '',
      obtainedAttendance: '',
      lastAttendanceDate: new Date().toISOString().split('T')[0],
      whetherFailed: '',
      tcCharge: '',
      toClass: '',
      classInWords: '',
      behaviorRemarks: '',
      rollNo: '',
      dateOfIssue: new Date().toISOString().split('T')[0],
      admitClass: '',
      feesPaidUpTo: '',
      feesConcessionAvailed: '',
      dateOfAdmission: new Date().toISOString().split('T')[0],
      schoolDetails: {
        schoolName: '',
        address: '',
        recognitionId: '',
        affiliationNo: '',
        contact: '',
        email: '',
        website: '',
        imageUrl: '',
      },
    });
    setAdmissionNumber('');
    setStudentDetails(null);
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[DEBUG] Processing admission number: "${admissionNumber}"`);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DEBUG] Fetching student data for admission number: "${admissionNumber}"`);
      const student = await fetchStudentData(admissionNumber);
      console.log('[DEBUG] Student data retrieved successfully:', student);
      
      setStudentDetails(student);
      setFormData((prev) => ({
        ...prev,
        admissionNumber: student.admissionNumber,
        studentName: student.fullName,
        studentClass: student.currentClass,
        motherName: student.motherName || prev.motherName,
        fatherName: student.fatherName || prev.fatherName,
        nationality: student.nationality || prev.nationality,
        category: student.category || prev.category,
        dateOfBirth: student.dateOfBirth || prev.dateOfBirth,
        subject: student.subjectStudied || prev.subject,
        generalConduct: student.conduct || prev.generalConduct,
        remarks: student.remarks || prev.remarks,
        dateOfLeaving: student.dateOfLeaving || prev.dateOfLeaving,
        dateOfIssue: student.dateOfIssue || prev.dateOfIssue,
        admitClass: student.admitClass || prev.admitClass,
        feesPaidUpTo: student.feesUpToDate || prev.feesPaidUpTo,
        gamesPlayed: student.gamesPlayed ? 
          (typeof student.gamesPlayed === 'string' ? 
            student.gamesPlayed.split(',').map(g => g.trim()) : 
            [...student.gamesPlayed]
          ) : [],
        extraActivity: student.extraActivity ? 
          (typeof student.extraActivity === 'string' ?
            student.extraActivity.split(',').map(a => a.trim()) :
            [...student.extraActivity]
          ) : [],
        schoolDetails: student.schoolDetails ? {
          ...prev.schoolDetails, 
          ...student.schoolDetails 
        } : prev.schoolDetails
      }));
    } catch (err) {
      console.error('[ERROR] Failed to fetch student data:', err);
      
      // More detailed error message
      if (err instanceof Error) {
        setError(`Student not found: ${err.message}. Please check the admission number.`);
      } else {
        setError('Student not found. Please check the admission number.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      'tcNo', 'studentName', 'admissionNumber', 'fatherName', 'motherName',
      'dateOfBirth', 'studentClass', 'dateOfLeaving', 'reason', 'generalConduct'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof IssuedCertificate]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      // Get school ID from local storage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = user.id;
      
      if (!schoolId) {
        toast.error('School information not found. Please log in again.');
        return;
      }
      
      // Ensure dates are in the correct format
      const formattedCertificate: IssuedCertificate = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        dateOfAdmission: new Date(formData.dateOfAdmission).toISOString(),
        dateOfLeaving: new Date(formData.dateOfLeaving).toISOString(),
        feesPaidUpTo: new Date(formData.feesPaidUpTo).toISOString(),
        lastAttendanceDate: new Date(formData.lastAttendanceDate).toISOString(),
        dateOfIssue: new Date(formData.dateOfIssue).toISOString(),
        // Convert to numbers where needed
        maxAttendance: formData.maxAttendance.toString(),
        obtainedAttendance: formData.obtainedAttendance.toString(),
        tcCharge: formData.tcCharge.toString(),
      };
      
      if (isEdit) {
        const updated = await updateCertificate(formattedCertificate);
        setIssuedCertificates((prev) =>
          prev.map((cert) => (cert.admissionNumber === admissionNumber ? updated : cert))
        );
        toast.success('Certificate updated successfully!');
      } else {
        const created = await createCertificate(formattedCertificate);
        setIssuedCertificates((prev) => [created, ...prev]);
        toast.success('Certificate created successfully!');
      }
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Operation failed: ${error.message}`);
      } else {
        toast.error('Operation failed. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-7xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Transfer Certificate' : 'Generate Transfer Certificate'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Number
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Enter admission number"
                readOnly={isEdit}
                required
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleAdmissionSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              )}
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.studentName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>

            {/* Academic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Admit Class</label>
              <input
                type="text"
                value={formData.admitClass}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Class</label>
              <input
                type="text"
                value={formData.studentClass}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text"
                value={formData.rollNo}
                className="w-full p-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>

            {/* Financial Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fees Paid Up To</label>
              <input
                type="date"
                value={formData.feesPaidUpTo}
                onChange={(e) => setFormData({ ...formData, feesPaidUpTo: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Academic Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Attendance</label>
              <input
                type="text"
                value={formData.maxAttendance}
                onChange={(e) => setFormData({ ...formData, maxAttendance: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Obtained Attendance</label>
              <input
                type="text"
                value={formData.obtainedAttendance}
                onChange={(e) => setFormData({ ...formData, obtainedAttendance: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Whether Failed</label>
              <select
                value={formData.whetherFailed}
                onChange={(e) => setFormData({ ...formData, whetherFailed: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(WhetherFailed).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Continue with other form fields... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Appeared In</label>
              <select
                value={formData.examIn}
                onChange={(e) => setFormData({ ...formData, examIn: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(ExamAppearedIn).map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualified for Promotion</label>
              <select
                value={formData.qualified}
                onChange={(e) => setFormData({ ...formData, qualified: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(QualifiedStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">To Class</label>
              <input
                type="text"
                value={formData.toClass}
                onChange={(e) => setFormData({ ...formData, toClass: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class in Words</label>
              <input
                type="text"
                value={formData.classInWords}
                onChange={(e) => setFormData({ ...formData, classInWords: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Existing Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">TC Number</label>
              <input
                type="text"
                value={formData.tcNo}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TC Charge</label>
              <input
                type="text"
                value={formData.tcCharge}
                onChange={(e) => setFormData({ ...formData, tcCharge: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
              <input
                type="date"
                value={formData.dateOfIssue}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, dateOfIssue: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Leaving</label>
              <input
                type="date"
                value={formData.dateOfLeaving}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee Concession</label>
              <select
                value={formData.feesConcessionAvailed}
                onChange={(e) => setFormData({ ...formData, feesConcessionAvailed: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(FeeConcessionStatus).map((concession) => (
                  <option key={concession} value={concession}>
                    {concession}
                  </option>
                ))}
              </select>
            </div>
            {/* Behavior and Conduct */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Conduct Remark</label>
              <input
                value={formData.behaviorRemarks}
                onChange={(e) => setFormData({ ...formData, behaviorRemarks: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter conduct remarks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remark</label>
              <select
                value={formData.generalConduct}
                onChange={(e) => setFormData({ ...formData, generalConduct: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(ConductStatus).map((conduct) => (
                  <option key={conduct} value={conduct}>
                    {conduct}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subjects Studied</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Enter subjects (comma separated)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Games Played */}
            <MultiSelectInput
              label="Games Played"
              options={Object.values(GamesPlayed)}
              selectedValues={formData.gamesPlayed}
              onChange={(selectedValues) =>
                setFormData({ ...formData, gamesPlayed: selectedValues })
              }
            />

            {/* Extra Activities */}
            <MultiSelectInput
              label="Extra Activities"
              options={Object.values(ExtraActivities)}
              selectedValues={formData.extraActivity}
              onChange={(selectedValues) =>
                setFormData({ ...formData, extraActivity: selectedValues })
              }
            />
          </div>

            {/* Transfer Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {Object.values(ReasonForLeaving).map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEdit ? 'Update Certificate' : 'Generate Certificate'}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TCFormModal;