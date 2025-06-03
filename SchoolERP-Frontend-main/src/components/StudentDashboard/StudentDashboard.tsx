// import React, { useState } from 'react';
// import StudentTable from '../StudentTable/StudentTable';

// interface Stats {
//   totalStudents: number;
//   totalMale: number;
//   totalFemale: number;
//   activeRegistrations: number;
// }

// const StudentDashboard: React.FC = () => {
//   const [stats, setStats] = useState<Stats>({
//     totalStudents: 0,
//     totalMale: 0,
//     totalFemale: 0,
//     activeRegistrations: 0
//   });

//   const handleStatsUpdate = (newStats: Stats) => {
//     setStats(newStats);
//   };

//   return (
//     <div className="p-6">
//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <div className="bg-blue-100 p-6 rounded-lg shadow">
//           <div className="text-blue-600 text-lg font-semibold">Total Students</div>
//           <div className="text-3xl font-bold mt-2">{stats.totalStudents}</div>
//         </div>
        
//         <div className="bg-green-100 p-6 rounded-lg shadow">
//           <div className="text-green-600 text-lg font-semibold">Active Registrations</div>
//           <div className="text-3xl font-bold mt-2">{stats.activeRegistrations}</div>
//         </div>
        
//         <div className="bg-purple-100 p-6 rounded-lg shadow">
//           <div className="text-purple-600 text-lg font-semibold">Total Male</div>
//           <div className="text-3xl font-bold mt-2">{stats.totalMale}</div>
//         </div>
        
//         <div className="bg-pink-100 p-6 rounded-lg shadow">
//           <div className="text-pink-600 text-lg font-semibold">Total Female</div>
//           <div className="text-3xl font-bold mt-2">{stats.totalFemale}</div>
//         </div>
//       </div>

//       {/* Student Table */}
//       <StudentTable onUpdateStats={handleStatsUpdate} />
//     </div>
//   );
// };

// export default StudentDashboard; 