import React from "react";
import { useNavigate } from "react-router-dom";

type Student = {
  formNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  regnDate: string;
  paymentStatus: string;
};

type StudentDataRowProps = {
  student: Student;
  onShowDetails?: (id: string) => void;
};

const StudentDataRow: React.FC<StudentDataRowProps> = ({ student, onShowDetails }) => {
  const navigate = useNavigate();

  const handleShowDetails = () => {
    // You can either use the onShowDetails prop if you want to keep that functionality
    if (onShowDetails) {
      onShowDetails(student.formNo);
    }
    
    // Or directly navigate to the student details page
    navigate(`/school/student/register/allstudent/${student.formNo}`);
  };

  return (
    <tr className="border-b border-gray-300">
      <td className="px-4 py-2">{`${student.firstName} ${student.lastName}`}</td>
      <td className="px-4 py-2">{student.formNo}</td>
      <td className="px-4 py-2">{student.gender}</td>
      <td className="px-4 py-2">{student.regnDate}</td>
      <td className="px-4 py-2">{student.paymentStatus}</td>
      <td className="px-4 py-2">
        <button
          onClick={handleShowDetails}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          Show Details
        </button>
      </td>
    </tr>
  );
};

export default StudentDataRow;
