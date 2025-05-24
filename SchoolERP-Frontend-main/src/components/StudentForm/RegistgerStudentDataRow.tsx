import React from "react";
import { useNavigate } from "react-router-dom";

type Student = {
  formNo: string;
  fullName: string;
  gender: string;
  regnDate: string;
  paymentStatus: string;
};

interface StudentDataRowProps {
  student: Student;
  onShowDetails: (student: Student) => void;
}

const StudentDataRow: React.FC<StudentDataRowProps> = ({ student, onShowDetails }) => {
  const navigate = useNavigate();

  return (
    <tr className="hover:bg-gray-50">
      <td className="border border-gray-300 px-4 py-2">{student.fullName}</td>
      <td className="border border-gray-300 px-4 py-2">{student.formNo}</td>
      <td className="border border-gray-300 px-4 py-2">{student.gender}</td>
      <td className="border border-gray-300 px-4 py-2">{student.regnDate}</td>
      <td className="border border-gray-300 px-4 py-2">{student.paymentStatus}</td>
      <td className="border border-gray-300 px-4 py-2">
        <button
          onClick={() => onShowDetails(student)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

export default StudentDataRow;
