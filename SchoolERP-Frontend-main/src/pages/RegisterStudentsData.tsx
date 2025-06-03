// import React, { useEffect } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { FaSearch } from "react-icons/fa";

// // import StudentDataTable from "../components/StudentDataTable";
// // import FilterComponent from "../components/FilterComponent";\
// import RegisterStudentDataTable from "./../components/StudentForm/RegisterStudentDataTable";

// type StudentResponse = {
//   students: any[]; // Replace 'any[]' with a proper Student type when available
// };

// const StudentDataPage: React.FC = () => {
//   const { className } = useParams<{ className?: string }>(); // Class filter from route
//   const location = useLocation(); // Search query from route
//   const navigate = useNavigate();


//   useEffect(() => {
//     const handleGetStudents = async () => {
//       let url = "http://localhost:5000/students";

//       // Handle class filtering
//       if (className) {
//         url += `/class/${className}`;
//       } 
//       // Handle admission number search
//       else if (location.search.includes("admissionNo")) {
//         const params = new URLSearchParams(location.search);
//         const admissionNo = params.get("admissionNo");
//         if (admissionNo) {
//           url += `?admissionNo=${admissionNo}`;
//         }
//       }

//       try {
//         const response = await fetch(url);
//         if (response.ok) {
//           const data: StudentResponse = await response.json();
//           console.log(data);
//         }
//       } catch (error) {
//         console.error("Error fetching student data:", error);
//       }
//     };
//     handleGetStudents();
//   }, []);

//   return (
//     <div className="w-full p-4 grid grid-cols-1">
//       <div className="border-gray-200 border rounded-xl p-4 shadow-sm shadow-gray-300">
//         {/* <h1 className="text-2xl font-bold text-center mb-6">Register Students Data</h1> */}

//         {/* Search and Filter Section */}
       

//           {/* Filter Component */}
//           <div className="flex flex-col gap-4 lg:flex-row">
//             {/* <FilterComponent className="flex-1" /> */}
//           </div>

//         {/* Student Data Table */}
//         <div className="mt-6 border border-gray-300 rounded-md p-4">
//           < RegisterStudentDataTable />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentDataPage;
