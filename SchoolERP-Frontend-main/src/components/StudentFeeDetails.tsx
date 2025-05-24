import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, CreditCard } from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  amount: number;
  mode: string;
  status: string;
  transactionId: string;
}

interface FeeDetailsProps {
  studentId: number;
  studentName: string;
  admissionNo: string;
  className: string;
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  lastPaymentDate?: string;
  payments: Payment[];
}

const StudentFeeDetails: React.FC<FeeDetailsProps> = ({
  studentName,
  admissionNo,
  className,
  totalFees,
  paidAmount,
  dueAmount,
  lastPaymentDate,
  payments,
}) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{studentName}</h2>
            <p className="text-sm text-gray-500">
              Admission No: {admissionNo} | Class: {className}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Statement
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Fees</p>
          <p className="text-2xl font-semibold text-blue-900">₹{totalFees.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Paid Amount</p>
          <p className="text-2xl font-semibold text-green-900">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Due Amount</p>
          <p className="text-2xl font-semibold text-red-900">₹{dueAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mode</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{payment.date}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{payment.mode}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        payment.status === 'Success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{payment.transactionId}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <Button className="w-full">
          <CreditCard className="h-4 w-4 mr-2" />
          Make Payment
        </Button>
      </div>
    </div>
  );
};

export default StudentFeeDetails;