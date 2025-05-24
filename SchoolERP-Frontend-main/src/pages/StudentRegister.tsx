import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  formNo: string;
  dob: string;
  category: string;
  religion: string;
  registerForClass: string;
  admissionCategory: string;
  bloodGroup: string;
  regnDate: string;
  testDate: string;
  transactionNo: string;
  singleParent: boolean;
  contactNo: string;
  studentEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  studentAadharCardNo: string;
  regnCharge: string;
  examSubject: string;
  paymentStatus: string;
  fatherName: string;
  fatherMobileNo: string;
  smsAlert: boolean;
  fatherEmail: string;
  fatherAadharCardNo: string;
  isFatherCampusEmployee: boolean;
  motherName: string;
  motherMobileNo: string;
  motherAadharCardNo: string;
  casteCertificate: File | null;
  studentAadharCard: File | null;
  fatherAadharCard: File | null;
  motherAadharCard: File | null;
  previousClassMarksheet: File | null;
  transferCertificate: File | null;
  studentDateOfBirthCertificate: File | null;
}

const StudentRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "",
    formNo: "",
    dob: "",
    category: "",
    religion: "",
    registerForClass: "",
    admissionCategory: "",
    bloodGroup: "",
    regnDate: "",
    testDate: "",
    transactionNo: "",
    singleParent: false,
    contactNo: "",
    studentEmail: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    studentAadharCardNo: "",
    regnCharge: "",
    examSubject: "",
    paymentStatus: "",
    fatherName: "",
    fatherMobileNo: "",
    smsAlert: false,
    fatherEmail: "",
    fatherAadharCardNo: "",
    isFatherCampusEmployee: false,
    motherName: "",
    motherMobileNo: "",
    motherAadharCardNo: "",
    casteCertificate: null,
    studentAadharCard: null,
    fatherAadharCard: null,
    motherAadharCard: null,
    previousClassMarksheet: null,
    transferCertificate: null,
    studentDateOfBirthCertificate: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files?.[0] || null : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value instanceof File ? value : String(value));
      }
    });

    try {
      const response = await fetch(
        `http://localhost:5000/register/student/addNew?formNo=${formData.formNo}`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      const data = await response.json();
      if (data.ok) {
        setLoading(false);
        alert("Registration submitted successfully!");
      }
    } catch (err) {
      setLoading(false);
      setError((err as Error).message);
      alert("Failed to submit registration. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <div className="text-center py-10">Submitting...</div>;
  // if (error)
  //   return (
  //     <div className="text-center py-10 text-red-500">
  //       {error}. Please ensure the backend server is running at
  //       http://localhost:5000.
  //     </div>
  //   );

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        STUDENT REGISTRATION
      </h1>
      <form onSubmit={handleSubmit}>
      {/* Student Information Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Student Information
        </h2>
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form No
            </label>
            <input
              type="text"
              name="formNo"
              value={formData.formNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="Date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="Text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Religion
            </label>
            <select
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Religion</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Register For Class
            </label>
            <input
              type="text"
              name="registerForClass"
              value={formData.registerForClass}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Category
            </label>
            <input
              type="text"
              name="admissionCategory"
              value={formData.admissionCategory}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <input
              type="text"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date
            </label>
            <input
              type="Date"
              name="regnDate"
              value={formData.regnDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Date
            </label>
            <input
              type="Date"
              name="testDate"
              value={formData.testDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracsaction Number
            </label>
            <input
              type="text"
              name="transactionNo"
              value={formData.transactionNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Email
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="Text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="Text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="Text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="Text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Aadhar Card Number
            </label>
            <input
              type="Text"
              name="studentAadharCardNo"
              value={formData.studentAadharCardNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Charge
            </label>
            <input
              type="Text"
              name="regnCharge"
              value={formData.regnCharge}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Subject
            </label>
            <input
              type="Text"
              name="examSubject"
              value={formData.examSubject}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <input
              type="Text"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Single Parent
            </label>
            <input
              type="checkbox"
              name="singleParent"
              checked={formData.singleParent}
              onChange={handleChange}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
     

      {/* Father Details Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Father Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Name
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Mobile No
            </label>
            <input
              type="text"
              name="fatherMobileNo"
              value={formData.fatherMobileNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Email
            </label>
            <input
              type="text"
              name="fatherEmail"
              value={formData.fatherEmail}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Aadhar Card No
            </label>
            <input
              type="text"
              name="fatherAadharCardNo"
              value={formData.fatherAadharCardNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS Alert
            </label>
            <input
              type="checkbox"
              name="smsAlert"
              checked={formData.smsAlert}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Father Campus Employee
            </label>
            <input
              type="checkbox"
              name="isFatherCampusEmployee"
              checked={formData.isFatherCampusEmployee}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Mother Details Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Mother Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Name
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Mobile No
            </label>
            <input
              type="text"
              name="motherMobileNo"
              value={formData.motherMobileNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Aadhar Card No
            </label>
            <input
              type="text"
              name="motherAadharCardNo"
              value={formData.motherAadharCardNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="p-6 border rounded-lg shadow-md bg-white mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caste Certificate
            </label>
            <input
              type="file"
              name="casteCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Aadhar Card
            </label>
            <input
              type="file"
              name="studentAadharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father Aadhar Card
            </label>
            <input
              type="file"
              name="fatherAadharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Aadhar Card
            </label>
            <input
              type="file"
              name="motherAdharCard"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Class Marksheet
            </label>
            <input
              type="file"
              name="previousClassMarksheet"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Certificate
            </label>
            <input
              type="file"
              name="transferCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Date of Birth Certificate
            </label>
            <input
              type="file"
              name="studentDateOfBirthCertificate"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => alert("Print Info")}
        >
          Print Info
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => alert("Print Form")}
        >
          Print Form
        </button>
        {loading ? (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Saving...
          </button>
        ) : (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            type="submit"
          >
            Save
          </button>
        )}
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          onClick={() =>
            setFormData({
              firstName: "",
              lastName: "",
              gender: "",
              formNo: "",
              dob: "",
              category: "",
              religion: "",
              registerForClass: "",
              admissionCategory: "",
              bloodGroup: "",
              regnDate: "",
              testDate: "",
              transactionNo: "",
              singleParent: false,
              contactNo: "",
              studentEmail: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              studentAadharCardNo: "",
              regnCharge: "",
              examSubject: "",
              paymentStatus: "",
              fatherName: "",
              fatherMobileNo: "",
              smsAlert: false,
              fatherEmail: "",
              fatherAadharCardNo: "",
              isFatherCampusEmployee: false,
              motherName: "",
              motherMobileNo: "",
              motherAadharCardNo: "",
              casteCertificate: null,
              studentAadharCard: null,
              fatherAadharCard: null,
              motherAadharCard: null,
              previousClassMarksheet: null,
              transferCertificate: null,
              studentDateOfBirthCertificate: null,
            })
          }
        >
          Reset
        </button>
      </div>
      </form>
    </div>
  );
};

export default StudentRegistration;
