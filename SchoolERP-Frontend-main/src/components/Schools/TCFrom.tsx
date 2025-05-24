// import React, { useState, useRef } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Eye, Edit, Trash, Printer, Search } from 'lucide-react';
// import { useReactToPrint } from 'react-to-print';

// interface StudentDetails {
//   fullName: string;
//   fatherName: string;
//   motherName: string;
//   nationality: string;
//   category: string;
//   dateOfBirth: string;
//   dateOfAdmission: string;
//   class: string;
//   section: string;
//   admissionNumber: string;
//   currentClass: string;
//   admitClass: string;
//   academicYear: string;
//   lastAttendanceDate: string;
//   lastClass: string;
//   tcNo: string;
//   school: string;
//   behavior: string;
//   feesUpToDate: string;
//   reason: string;
//   maxAttendance: string;
//   obtainedAttendance: string;
//   lastExam: string;
//   whetherFailed: string;
//   tcCharge: string;
//   examIn: string;
//   qualified: string;
//   toClass: string;
//   classInWords: string;
//   conduct: string;
//   remark: string;
//   behaviorRemarks: string;
//   subjectStudied: string;
//   gamesPlayed: string;
//   extraActivity: string;
//   rollNo: string;
//   dateOfLeaving: string;
//   dateOfIssue: string;
//   Remarks: string;
// }

// interface CertificateDetails {
//   studentName: string;
//   studentClass: string;
//   issueDate: string;
//   leavingDate: string;
//   motherName: string;
//   fatherName: string;
//   nationality: string;
//   category: string;
//   dateOfBirth: string;
//   lastClass: string;
//   reason: string;
//   examIn: string;
//   qualified: string;
//   gamesPlayed: string;
//   extraActivity: string;
//   subject: string;
//   generalConduct: string;
//   dateOfLeaving: string;
//   remarks: string;
// }

// interface IssuedCertificate extends CertificateDetails {
//   admissionNumber: string;
//   tcNo: string;
// }

// const dummyStudentData = {
//   "12345": {
//     fullName: "John Doe",
//     fatherName: "Michael Doe",
//     motherName: "Sarah Doe",
//     category: "General",
//     nationality: "American",
//     dateOfBirth: "2005-05-15",
//     dateOfAdmission: "2020-06-01",
//     admissionNumber: "12345",
//     currentClass: "10th Grade",
//     section: "A",
//     admitClass: "9th Grade",
//     academicYear: "2023-2024",
//     lastAttendanceDate: "2024-03-15",
//     behavior: "Excellent",
//     feesUptoDate: "2024-03-15",
//     reason: "",
//     lastExam: "Final Exam",
//     whetherFailed: "No",
//     tcCharge: "Paid",
//     examIn: "School",
//     qualified: "Yes",
//     toClass: "11th Grade",
//     classInWords: "Eleventh",
//     maxAttendance: "220",
//     obtainedAttendance: "210",
//     conduct: "Good",
//     remark: "Good student",
//     subjectStudied: "Math, Science",
//     gamesPlayed: "Football",
//     extraActivity: "Music",
//     rollNo: "123",
//     dateOfLeaving: "2024-03-15",
//     dateOfIssue: "2024-03-18",
//     Remarks: "None",
//   },
//   "67890": {
//     fullName: "Jane Smith",
//     fatherName: "Robert Smith",
//     motherName: "Mary Smith",
//     category: "SC",
//     nationality: "British",
//     dateOfBirth: "2006-08-22",
//     dateOfAdmission: "2021-06-01",
//     admissionNumber: "67890",
//     currentClass: "9th Grade",
//     section: "A",
//     admitClass: "8th Grade",
//     academicYear: "2023-2024",
//     lastAttendanceDate: "2024-03-15",
//     behavior: "Good",
//     feesUptoDate: "2024-02-28",
//     reason: "",
//     lastExam: "Midterm Exam",
//     whetherFailed: "No",
//     tcCharge: "Unpaid",
//     examIn: "Private",
//     qualified: "No",
//     toClass: "10th Grade",
//     classInWords: "Tenth",
//     maxAttendance: "220",
//     obtainedAttendance: "210",
//     conduct: "Satisfactory",
//     remark: "Needs improvement",
//     subjectStudied: "English, History",
//     gamesPlayed: "Basketball",
//     extraActivity: "Drama",
//     rollNo: "456",
//     dateOfLeaving: "2024-03-15",
//     dateOfIssue: "2024-03-18",
//     Remarks: "None",
//   },
// };

// const dummyIssuedCertificates: IssuedCertificate[] = [
//   {
//     studentName: "John Doe",
//     studentClass: "10th Grade",
//     admissionNumber: "12345",
//     motherName: "Jane Doe",
//     fatherName: "John Doe",
//     nationality: "American",
//     category: "General",
//     dateOfBirth: "2005-05-15",
//     lastClass: "10th Grade",
//     issueDate: "2024-03-10",
//     leavingDate: "2024-03-15",
//     reason: "Family relocation",
//     examIn: "School",
//     qualified: "Yes",
//     gamesPlayed: "Football",
//     extraActivity: "Music",
//     tcNo: "520",
//     subject: "Math, Science",
//     generalConduct: "Good",
//     dateOfLeaving: "2024-03-15",
//     remarks: "None",
//   },
//   {
//     studentName: "Jane Smith",
//     studentClass: "9th Grade",
//     admissionNumber: "67890",
//     motherName: "Jane Smith",
//     fatherName: "Robert Smith",
//     nationality: "British",
//     category: "SC",
//     dateOfBirth: "2006-08-22",
//     lastClass: "9th Grade",
//     issueDate: "2024-03-12",
//     leavingDate: "2024-03-15",
//     reason: "Change of residence",
//     examIn: "Private",
//     qualified: "No",
//     gamesPlayed: "Basketball",
//     extraActivity: "Drama",
//     tcNo: "234",
//     subject: "English, History",
//     generalConduct: "Satisfactory",
//     dateOfLeaving: "2024-03-15",
//     remarks: "None",
//   },
// ];

// export default function TCForm() {
//   const componentRef = useRef<HTMLDivElement>(null);
//   const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
//   const [admissionNumber, setAdmissionNumber] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [certificateGenerated, setCertificateGenerated] = useState(false);
//   const [certificateDetails, setCertificateDetails] = useState<CertificateDetails | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>(dummyIssuedCertificates);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedCertificate, setSelectedCertificate] = useState<IssuedCertificate | null>(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null);
//   const [filterClass, setFilterClass] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   const fetchStudentData = async (admissionNo: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
//       if (dummyStudentData[admissionNo]) {
//         setStudentDetails(dummyStudentData[admissionNo]);
//       } else {
//         setError("Student not found. Please check the admission number.");
//         setStudentDetails(null);
//       }
//     } catch (err) {
//       setError("Error fetching student data");
//       setStudentDetails(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAdmissionSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (admissionNumber.length >= 5) {
//       fetchStudentData(admissionNumber);
//     } else {
//       setError("Please enter a valid admission number");
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (studentDetails) {
//       const newCertificate: IssuedCertificate = {
//         studentName: studentDetails.fullName,
//         studentClass: studentDetails.currentClass,
//         admissionNumber: studentDetails.admissionNumber,
//         issueDate: new Date().toISOString().split('T')[0],
//         leavingDate: studentDetails.dateOfLeaving,
//         tcNo: studentDetails.tcNo,
//         reason: studentDetails.reason,
//         examIn: studentDetails.examIn,
//         qualified: studentDetails.qualified,
//         gamesPlayed: studentDetails.gamesPlayed,
//         extraActivity: studentDetails.extraActivity,
//         motherName: studentDetails.motherName,
//         fatherName: studentDetails.fatherName,
//         nationality: studentDetails.nationality,
//         category: studentDetails.category,
//         dateOfBirth: studentDetails.dateOfBirth,
//         lastClass: studentDetails.currentClass,
//         subject: studentDetails.subjectStudied,
//         generalConduct: studentDetails.conduct,
//         remarks: studentDetails.Remarks,
//         dateOfLeaving: studentDetails.dateOfLeaving,
//       };
//       setIssuedCertificates(prev => [newCertificate, ...prev]);
//       setCertificateDetails(newCertificate);
//       setCertificateGenerated(true);
//       setIsModalOpen(false);
//       toast.success('Transfer Certificate generated successfully!');
//     }
//   };

//   // const handleError = (message: string) => {
//   //   toast.error(message);
//   // };

//   const handleViewCertificate = (certificate: IssuedCertificate) => {
//     setSelectedCertificate(certificate); // Ensure this is being called
//     setIsViewModalOpen(true);
//   };

//   const handleEditCertificate = (certificate: IssuedCertificate) => {
//     setSelectedCertificate(certificate);
//     setIsEditModalOpen(true);
//   };

//   const handleDeleteCertificate = (admissionNumber: string) => {
//     setCertificateToDelete(admissionNumber);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDeleteCertificate = () => {
//     if (certificateToDelete) {
//       setIssuedCertificates(prev =>
//         prev.filter(cert => cert.admissionNumber !== certificateToDelete)
//       );
//       toast.success('Certificate deleted successfully');
//       setIsDeleteModalOpen(false);
//       setCertificateToDelete(null);
//     }
//   };

//   const handleUpdateCertificate = (updatedCertificate: IssuedCertificate) => {
//     setIssuedCertificates(prev =>
//       prev.map(cert =>
//         cert.admissionNumber === updatedCertificate.admissionNumber
//           ? updatedCertificate
//           : cert
//       )
//     );
//     setIsEditModalOpen(false);
//     toast.success('Certificate updated successfully');
//   };

//   const filteredCertificates = issuedCertificates.filter(certificate => {
//     const matchesClass = filterClass
//       ? certificate.studentClass.toLowerCase().trim() === filterClass.toLowerCase().trim()
//       : true;

//     const matchesSearch = searchQuery
//       ? Object.values(certificate).some(value =>
//         String(value).toLowerCase().includes(searchQuery.toLowerCase())
//       )
//       : true;

//     return matchesClass && matchesSearch;
//   });

//   const handlePrint = useReactToPrint({
//     content: () => componentRef.current,
//     documentTitle: "Transfer_Certificate",
//     onAfterPrint: () => toast.success("Certificate printed successfully!"),
//     onPrintError: () => toast.error("Failed to print the certificate. Please try again."),
//   });


//   return (
//     <div className="bg-white min-h-screen">
//       <ToastContainer position="top-right" />
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Transfer Certificates</h2>
//             <p className="text-gray-600 mt-1">Manage and generate student transfer certificates</p>
//           </div>
//           <button
//             onClick={() => {
//               setIsModalOpen(true);
//               setStudentDetails({
//                 fullName: "",
//                 fatherName: "",
//                 motherName: "",
//                 nationality: "",
//                 category: "",
//                 dateOfBirth: "",
//                 dateOfAdmission: "",
//                 class: "",
//                 section: "",
//                 admitClass: "",
//                 admissionNumber: "",
//                 currentClass: "",
//                 academicYear: "",
//                 lastAttendanceDate: "",
//                 lastClass: "",
//                 tcNo: "",
//                 school: "",
//                 behavior: "",
//                 feesUpToDate: "",
//                 reason: "",
//                 maxAttendance: "",
//                 obtainedAttendance: "",
//                 lastExam: "",
//                 whetherFailed: "",
//                 tcCharge: "",
//                 examIn: "",
//                 qualified: "",
//                 toClass: "",
//                 classInWords: "",
//                 conduct: "",
//                 remark: "",
//                 behaviorRemarks: "",
//                 subjectStudied: "",
//                 gamesPlayed: "",
//                 extraActivity: "",
//                 rollNo: "",
//                 dateOfLeaving: "",
//                 dateOfIssue: "",
//                 Remarks: "",
//               });
//             }}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//             </svg>
//             Generate New Certificate
//           </button>
//         </div>
//       </div>
//       <div className="p-6">
//         <div className="p-6">
//           <div className="flex gap-4 mb-6">
//             <select
//               value={filterClass}
//               onChange={(e) => setFilterClass(e.target.value)}
//               className="p-2 border rounded-md"
//             >
//               <option value="">Filter by Class</option>
//               <option value="9th Grade">9th Grade</option>
//               <option value="10th Grade">10th Grade</option>
//             </select>
//             <div className="flex-1 relative">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full p-2 border rounded-md pl-10"
//                 placeholder="Search by name, admission number, or TC no"
//               />
//               <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       TC No.
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Student Name
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Class
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Admission No.
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Issue Date
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Leaving Date
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredCertificates.map((certificate, index) => (
//                     <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {certificate.tcNo}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {certificate.studentName}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {certificate.studentClass}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {certificate.admissionNumber}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {certificate.issueDate}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {certificate.leavingDate}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <div className="flex justify-end space-x-2">
//                           <button
//                             className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full"
//                             title="View Certificate" onClick={() => handleViewCertificate(certificate)}
//                           >
//                             <Eye className="h-5 w-5" />
//                           </button>
//                           <button
//                             className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-full"
//                             title="Edit Certificate" onClick={() => handleEditCertificate(certificate)}
//                           >
//                             <Edit className="h-5 w-5" />
//                           </button>
//                           <button
//                             className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
//                             title="Delete Certificate" onClick={() => handleDeleteCertificate(certificate.admissionNumber)}
//                           >
//                             <Trash className="h-5 w-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {filteredCertificates.length === 0 && (
//                 <div className="text-center py-12">
//                   <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
//                   <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           {isModalOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-xl p-6 max-w-7xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
//                 <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                   <h3 className="text-xl font-bold text-gray-900">Generate Transfer Certificate</h3>
//                   <button
//                     onClick={() => setIsModalOpen(false)}
//                     className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <form onSubmit={handleAdmissionSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Enter Admission Number
//                     </label>
//                     <div className="flex gap-4">
//                       <input
//                         type="text"
//                         value={admissionNumber}
//                         onChange={(e) => setAdmissionNumber(e.target.value)}
//                         className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter admission number (e.g., 12345)"
//                         required
//                       />
//                       <button
//                         type="submit"
//                         className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
//                         disabled={isLoading}
//                       >
//                         {isLoading ? "Searching..." : "Search"}
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//                 {error && (
//                   <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
//                     {error}
//                   </div>
//                 )}
//                 {studentDetails && (
//                   <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div className="col-span-3">
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                         <input
//                           type="text"
//                           value={studentDetails.fullName}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Father's Name</label>
//                         <input
//                           type="text"
//                           value={studentDetails.fatherName}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
//                         <input
//                           type="text"
//                           value={studentDetails.motherName}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Nationality</label>
//                         <input
//                           type="text"
//                           value={studentDetails.nationality}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Category</label>
//                         <input
//                           type="text"
//                           value={studentDetails.category}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//                         <input
//                           type="date"
//                           value={studentDetails.dateOfBirth}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Date of Admission</label>
//                         <input
//                           type="date"
//                           value={studentDetails.dateOfAdmission}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Admission Number</label>
//                         <input
//                           type="text"
//                           value={studentDetails.admissionNumber}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Roll No.</label>
//                         <input
//                           type="text"
//                           value={studentDetails.rollNo}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Current Class</label>
//                         <input
//                           type="text"
//                           value={studentDetails.currentClass}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Section</label>
//                         <input
//                           type="text"
//                           value={studentDetails.section}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Admit Class</label>
//                         <input
//                           type="text"
//                           value={studentDetails.admitClass}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Studied/Studying Class</label>
//                         <input
//                           type="text"
//                           value={studentDetails.currentClass}
//                           className="w-full p-2 border rounded-md bg-gray-50"
//                           readOnly
//                         />
//                       </div>
//                       {/* <div>
//                     <label className="block text-sm font-medium text-gray-700">Academic Year</label>
//                     <input
//                       type="text"
//                       value={studentDetails.academicYear}
//                       className="w-full p-2 border rounded-md bg-gray-50"
//                       readOnly
//                     />
//                   </div> */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">TC Number</label>
//                         <input
//                           type="text"
//                           value={studentDetails.tcNo}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, tcNo: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter TC Number"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Class in Words</label>
//                         <input
//                           type="text"
//                           value={studentDetails.classInWords}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, classInWords: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter Class in Words (e.g., Tenth, Ninth)"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Max Attendance</label>
//                         <input
//                           type="text"
//                           value={studentDetails.maxAttendance}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, maxAttendance: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter Max Attendance"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Obtained Attendance</label>
//                         <input
//                           type="text"
//                           value={studentDetails.obtainedAttendance}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, obtainedAttendance: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter Obtained Attendance"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Last Attendance Date</label>
//                         <input
//                           type="date"
//                           value={studentDetails.lastAttendanceDate}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, lastAttendanceDate: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Fees Up To (Date)</label>
//                         <input
//                           type="date"
//                           value={studentDetails.feesUpToDate}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, feesUpToDate: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Behavior</label>
//                         <select
//                           value={studentDetails.behavior}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, behavior: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select Behavior</option>
//                           <option value="Excellent">Excellent</option>
//                           <option value="Good">Good</option>
//                           <option value="Satisfactory">Satisfactory</option>
//                           <option value="Needs Improvement">Needs Improvement</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Reason for Transfer</label>
//                         <select
//                           value={studentDetails.reason}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, reason: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select</option>
//                           <option value="Admission in other school">Admission in other school</option>
//                           <option value="Due to long absence without information">Due to long absence without information</option>
//                           <option value="Father's Job Transfer">Father's Job Transfer</option>
//                           <option value="Get Admission in Higher Class">Get Admission in Higher Class</option>
//                           <option value="Going to native place">Going to native place</option>
//                           <option value="Parent's Will">Parent's Will</option>
//                           <option value="Passed out from the school">Passed out from the school</option>
//                           <option value="Shifting to other place">Shifting to other place</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Whether Failed</label>
//                         <select
//                           value={studentDetails.whetherFailed}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, whetherFailed: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select</option>
//                           <option value="No">No</option>
//                           <option value="N/A">N/A</option>
//                           <option value="Yes">Yes</option>
//                           <option value="C.B.S.E Board">C.B.S.E Board</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Exam Appeared In</label>
//                         <select
//                           value={studentDetails.examIn}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, examIn: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select</option>
//                           <option value="School">School</option>
//                           <option value="Board">Board</option>
//                           <option value="N/A">N/A</option>
//                           <option value="N.A.">N.A.</option>
//                           <option value="C.B.S.E Board">C.B.S.E Board</option>
//                           <option value="School, Failed">School, Failed</option>
//                           <option value="School, Passed">School, Passed</option>
//                           <option value="School, Compartment">School, Compartment</option>
//                           <option value="Board, Passed">Board, Passed</option>
//                           <option value="Board, Failed">Board, Failed</option>
//                           <option value="Board, Compartment">Board, Compartment</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Qualified</label>
//                         <select
//                           value={studentDetails.qualified}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, qualified: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select</option>
//                           <option value="Yes">Yes</option>
//                           <option value="No">No</option>
//                           <option value="N/A">N/A</option>
//                           <option value="Pass">Pass</option>
//                           <option value="Fail">Fail</option>
//                           <option value="Compartment">Compartment</option>
//                           <option value="As per CBSE Board Result">As per CBSE Board Result</option>
//                           <option value="Appeared in class X Exam">Appeared in class X Exam</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">To Class</label>
//                         <input
//                           type="text"
//                           value={studentDetails.toClass}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, toClass: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter the class the student is transferring to"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">TC Charge Status</label>
//                         <select
//                           value={studentDetails.tcCharge}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, tcCharge: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         >
//                           <option value="Paid">Paid</option>
//                           <option value="Unpaid">Unpaid</option>
//                           <option value="Exempted">Exempted</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Games Played</label>
//                         <select
//                           value={studentDetails.gamesPlayed}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, gamesPlayed: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         >
//                           <option value="">Select</option>
//                           <option value="Football">Football</option>
//                           <option value="Cricket">Cricket</option>
//                           <option value="Swimming">Swimming</option>
//                           <option value="Basketball">Basketball</option>
//                           <option value="Kabaddi">Kabaddi</option>
//                           <option value="Volleyball">Volleyball</option>
//                           <option value="Athlete">Athlete</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Extra Curricular Activities</label>
//                         <select
//                           value={studentDetails.extraActivity}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, extraActivity: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         >
//                           <option value="">Select</option>
//                           <option value="N/A">Participate in stage show</option>
//                           <option value="N/A">Participate in sports</option>
//                           <option value="N/A">Participate in debate</option>
//                           <option value="N/A">Participate in quiz</option>
//                           <option value="N/A">Participate in painting</option>
//                           <option value="N/A">Participate in singing</option>
//                           <option value="N/A">Participate in dancing</option>
//                           <option value="N/A">Participate in other</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Counduct</label>
//                         <input
//                           type="text"
//                           value={studentDetails.conduct}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, conduct: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Date of Leaving</label>
//                         <input
//                           type="date"
//                           value={studentDetails.dateOfLeaving}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, dateOfLeaving: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
//                         <input
//                           type="date"
//                           value={studentDetails.dateOfIssue}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, dateOfIssue: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                         />
//                       </div>
//                       <div className="col-span-3">
//                         <label className="block text-sm font-medium text-gray-700">Conduct/Behavior Remark</label>
//                         <textarea
//                           value={studentDetails.behaviorRemarks}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, behaviorRemarks: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           rows={2}
//                         ></textarea>
//                       </div>
//                       <div className="col-span-3">
//                         <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                         <textarea
//                           value={studentDetails.Remarks}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, Remarks: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           rows={2}
//                         ></textarea>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Subjects Studied</label>
//                         <input
//                           type="text"
//                           value={studentDetails.subjectStudied}
//                           onChange={(e) => setStudentDetails({ ...studentDetails, subjectStudied: e.target.value })}
//                           className="w-full p-2 border rounded-md"
//                           placeholder="Enter Subjects Studied (e.g., Math, Science)"
//                           required
//                         />
//                       </div>
//                       <div className="col-span-3 flex justify-end gap-4 mt-6">
//                         <button
//                           type="button"
//                           onClick={() => setIsModalOpen(false)}
//                           className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="submit"
//                           className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                         >
//                           Generate Certificate
//                         </button>
//                       </div>
//                     </div>
//                   </form>
//                 )}
//               </div>
//             </div>
//           )}
//           {isViewModalOpen && selectedCertificate && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-xl p-8 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
//                 <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                   <h3 className="text-xl font-bold text-gray-900">Transfer Certificate</h3>
//                   <button
//                     onClick={() => setIsViewModalOpen(false)}
//                     className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div ref={componentRef} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
//                   <div className="text-center mb-6">
//                     <h3 className="text-xl font-bold uppercase">TRANSFER CERTIFICATE</h3>
//                     <p className="text-gray-600 mt-1">School Management System</p>
//                   </div>
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <span className="text-gray-600 text-sm">TC No:</span>
//                         <p className="font-medium">{selectedCertificate.tcNo}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-600 text-sm">Admission No:</span>
//                         <p className="font-medium">{selectedCertificate.admissionNumber}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-600 text-sm">Issue Date:</span>
//                         <p className="font-medium">{selectedCertificate.issueDate}</p>
//                       </div>
//                     </div>
//                     <div className="border-t border-gray-200 pt-4">
//                       <h4 className="font-medium mb-2">Student Information</h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <span className="text-gray-600 text-sm">Name:</span>
//                           <p className="font-medium">{selectedCertificate.studentName}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Father's Name:</span>
//                           <p className="font-medium">{selectedCertificate.fatherName}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Mother's Name:</span>
//                           <p className="font-medium">{selectedCertificate.motherName}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Nationality:</span>
//                           <p className="font-medium">{selectedCertificate.nationality}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Category:</span>
//                           <p className="font-medium">{selectedCertificate.category}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Date of Birth:</span>
//                           <p className="font-medium">{selectedCertificate.dateOfBirth}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Class Last Attended:</span>
//                           <p className="font-medium">{selectedCertificate.lastClass}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Subjects Studied:</span>
//                           <p className="font-medium">{selectedCertificate.subject}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Qualified for Promotion:</span>
//                           <p className="font-medium">{selectedCertificate.qualified}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Games Played:</span>
//                           <p className="font-medium">{selectedCertificate.gamesPlayed}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Extra-Curricular Activities:</span>
//                           <p className="font-medium">{selectedCertificate.extraActivity}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">General Conduct:</span>
//                           <p className="font-medium">{selectedCertificate.generalConduct}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Date of Leaving:</span>
//                           <p className="font-medium">{selectedCertificate.dateOfLeaving}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Reason for Leaving:</span>
//                           <p className="font-medium">{selectedCertificate.reason}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600 text-sm">Remarks:</span>
//                           <p className="font-medium">{selectedCertificate.remarks}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 flex justify-end">
//                   <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//                     Close
//                   </button>
//                   <button 
//                     onClick={handlePrint} 
//                     className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-2"
//                   >
//                     <Printer className="h-5 w-5 inline-block" /> Print
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {isEditModalOpen && selectedCertificate && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-xl p-8 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-4">
//                 <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                   <h3 className="text-xl font-bold text-gray-900">Edit Transfer Certificate</h3>
//                   <button
//                     onClick={() => setIsEditModalOpen(false)}
//                     className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault();
//                     if (selectedCertificate) {
//                       handleUpdateCertificate(selectedCertificate);
//                     }
//                   }}
//                 >
//                   <div className="space-y-4">
//                     {/* Editable Fields */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Reason for Transfer</label>
//                       <select
//                         value={selectedCertificate.reason}
//                         onChange={(e) =>
//                           setSelectedCertificate({ ...selectedCertificate, reason: e.target.value })
//                         }
//                         className="w-full p-2 border rounded-md"
//                         required
//                       >
//                         <option value="">Select Reason</option>
//                         <option value="Admission in other school">Admission in other school</option>
//                         <option value="Due to long absence without information">
//                           Due to long absence without information
//                         </option>
//                         <option value="Father's Job Transfer">Father's Job Transfer</option>
//                         <option value="Get Admission in Higher Class">Get Admission in Higher Class</option>
//                         <option value="Going to native place">Going to native place</option>
//                         <option value="Parent's Will">Parent's Will</option>
//                         <option value="Passed out from the school">Passed out from the school</option>
//                         <option value="Shifting to other place">Shifting to other place</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Exam Appeared In</label>
//                       <select
//                         value={selectedCertificate.examIn}
//                         onChange={(e) =>
//                           setSelectedCertificate({ ...selectedCertificate, examIn: e.target.value })
//                         }
//                         className="w-full p-2 border rounded-md"
//                         required
//                       >
//                         <option value="">Select Exam</option>
//                         <option value="School">School</option>
//                         <option value="Board">Board</option>
//                         <option value="N/A">N/A</option>
//                         <option value="C.B.S.E Board">C.B.S.E Board</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Qualified for Promotion</label>
//                       <select
//                         value={selectedCertificate.qualified}
//                         onChange={(e) =>
//                           setSelectedCertificate({ ...selectedCertificate, qualified: e.target.value })
//                         }
//                         className="w-full p-2 border rounded-md"
//                         required
//                       >
//                         <option value="">Select Qualification</option>
//                         <option value="Yes">Yes</option>
//                         <option value="No">No</option>
//                         <option value="N/A">N/A</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Games Played</label>
//                       <select
//                         value={selectedCertificate.gamesPlayed}
//                         onChange={(e) => setStudentDetails({ ...selectedCertificate, gamesPlayed: e.target.value })}
//                         className="w-full p-2 border rounded-md"
//                       >
//                         <option value="">Select</option>
//                         <option value="Football">Football</option>
//                         <option value="Cricket">Cricket</option>
//                         <option value="Swimming">Swimming</option>
//                         <option value="Basketball">Basketball</option>
//                         <option value="Kabaddi">Kabaddi</option>
//                         <option value="Volleyball">Volleyball</option>
//                         <option value="Athlete">Athlete</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Extra Curricular Activities</label>
//                       <select
//                         value={selectedCertificate.extraActivity}
//                         onChange={(e) => setStudentDetails({ ...selectedCertificate, extraActivity: e.target.value })}
//                         className="w-full p-2 border rounded-md"
//                       >
//                         <option value="">Select</option>
//                         <option value="N/A">Participate in stage show</option>
//                         <option value="N/A">Participate in sports</option>
//                         <option value="N/A">Participate in debate</option>
//                         <option value="N/A">Participate in quiz</option>
//                         <option value="N/A">Participate in painting</option>
//                         <option value="N/A">Participate in singing</option>
//                         <option value="N/A">Participate in dancing</option>
//                         <option value="N/A">Participate in other</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">TC Number</label>
//                       <input
//                         type="text"
//                         value={selectedCertificate.tcNo}
//                         onChange={(e) =>
//                           setSelectedCertificate({ ...selectedCertificate, tcNo: e.target.value })
//                         }
//                         className="w-full p-2 border rounded-md"
//                         placeholder="Enter TC Number"
//                         required
//                       />
//                     </div>
//                     {/* Buttons */}
//                     <div className="flex justify-end gap-4 mt-6">
//                       <button
//                         type="button"
//                         onClick={() => setIsEditModalOpen(false)}
//                         className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                       >
//                         Save Changes
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//           {isDeleteModalOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-xl p-8 max-w-md w-[95%]">
//                 <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
//                   <h3 className="text-xl font-bold text-gray-900">Delete Certificate</h3>
//                   <button
//                     onClick={() => setIsDeleteModalOpen(false)}
//                     className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <p className="text-gray-700 mb-6">Are you sure you want to delete this certificate?</p>
//                 <div className="flex justify-end gap-4">
//                   <button
//                     onClick={() => setIsDeleteModalOpen(false)}
//                     className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmDeleteCertificate}
//                     className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
