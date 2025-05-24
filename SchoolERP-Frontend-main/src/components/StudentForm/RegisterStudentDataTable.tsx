import React, { useEffect, useState } from "react";
import StudentDataRow from "./RegistgerStudentDataRow";

type Student = {
  formNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  regnDate: string;
  paymentStatus: string;
};

const StudentDataTable: React.FC = () => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:5000/register/student/allStudent");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        const allStudent: Student[] = data.data;
        setStudentData(allStudent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleShowDetails = (id: string) => {
    alert(`Showing details for student ID: ${id}`);
  };

  return (
    <div className="p-4 rounded-2xl">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="rounded-2xl bg-amber-200">
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Student Name</th>
              <th className="border border-gray-300 px-4 py-2">Form No</th>
              <th className="border border-gray-300 px-4 py-2">Gender</th>
              <th className="border border-gray-300 px-4 py-2">Registration Date</th>
              <th className="border border-gray-300 px-4 py-2">Payment Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <StudentDataRow
                key={student.formNo}
                student={student}
                onShowDetails={handleShowDetails}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentDataTable;
