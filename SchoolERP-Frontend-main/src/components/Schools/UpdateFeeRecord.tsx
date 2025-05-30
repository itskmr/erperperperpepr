import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Types
interface FeeRecord {
  id: string;
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  section: string;
  totalFees: number;
  amountPaid: number;
  feeAmount: number;
  paymentDate: string;
  paymentMode: string;
  receiptNumber: string;
  status: 'Paid' | 'Pending' | 'Partial';
  feeCategory?: string;
  feeCategories?: string[];
  discountType?: string;
  discountAmount?: number;
  discountValue?: number;
  amountAfterDiscount?: number;
}

interface UpdateFeeRecordProps {
  isOpen: boolean;
  onClose: () => void;
  record: FeeRecord | null;
  onUpdate: (updatedRecord: FeeRecord) => void;
  classOptions: string[];
  sectionOptions: string[];
  feeCategories?: string[];
}

const API_URL = 'http://localhost:5000/api/fees';

const UpdateFeeRecord: React.FC<UpdateFeeRecordProps> = ({
  isOpen,
  onClose,
  record,
  onUpdate,
  classOptions,
  sectionOptions,
  feeCategories = []
}) => {
  const [formData, setFormData] = useState<FeeRecord>({
    id: '',
    admissionNumber: '',
    studentName: '',
    fatherName: '',
    class: '',
    section: '',
    totalFees: 0,
    amountPaid: 0,
    feeAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    receiptNumber: '',
    status: 'Paid',
    feeCategory: '',
    feeCategories: [],
    discountType: '',
    discountAmount: 0,
    discountValue: 0,
    amountAfterDiscount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalAmountPaid, setOriginalAmountPaid] = useState(0);
  const [originalFeeAmount, setOriginalFeeAmount] = useState(0);
  const [customDiscountType, setCustomDiscountType] = useState('');
  
  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({...record});
      setOriginalFeeAmount(record.feeAmount);
      setOriginalAmountPaid(record.amountPaid - record.feeAmount); // Original amount paid without current payment
    }
  }, [record]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: ['feeAmount', 'totalFees', 'amountPaid', 'discountAmount'].includes(name) ? parseFloat(value) || 0 : value
      };

      // Calculate discount values when discount type or amount changes
      if (name === 'discountAmount' || name === 'discountType' || name === 'feeAmount') {
        const discountPercent = parseFloat(String(updatedData.discountAmount)) || 0;
        const totalAmount = updatedData.feeAmount || 0;
        
        if (updatedData.discountType && discountPercent > 0) {
          updatedData.discountValue = (totalAmount * discountPercent) / 100;
          updatedData.amountAfterDiscount = totalAmount - updatedData.discountValue;
        } else {
          updatedData.discountValue = 0;
          updatedData.amountAfterDiscount = totalAmount;
        }
      }

      // When feeAmount changes, recalculate the amountPaid
      if (name === 'feeAmount') {
        const newFeeAmount = parseFloat(value) || 0;
        // Remove original fee amount and add the new one
        updatedData.amountPaid = originalAmountPaid + newFeeAmount;
      }

      // When totalFees changes, we need to recalculate the status
      if (name === 'totalFees' && updatedData.amountPaid > 0) {
        if (updatedData.amountPaid >= updatedData.totalFees) {
          updatedData.status = 'Paid';
        } else if (updatedData.amountPaid > 0) {
          updatedData.status = 'Partial';
        } else {
          updatedData.status = 'Pending';
        }
      }

      // If status is manually changed
      if (name === 'status') {
        // If setting to "Paid" but amount doesn't match, adjust amount
        if (value === 'Paid' && updatedData.amountPaid < updatedData.totalFees) {
          updatedData.amountPaid = updatedData.totalFees;
          // Update feeAmount to make up the difference
          updatedData.feeAmount = updatedData.totalFees - originalAmountPaid;
        }
        // If setting to "Pending" but amount is not zero, set amount to zero
        else if (value === 'Pending' && updatedData.amountPaid > 0) {
          updatedData.amountPaid = 0;
          updatedData.feeAmount = 0;
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Formatting the date for the API
      const formattedDate = formData.paymentDate ? 
        new Date(formData.paymentDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      // Convert feeCategories array to string for the API
      let feeCat = '';
      if (Array.isArray(formData.feeCategories) && formData.feeCategories.length > 0) {
        feeCat = formData.feeCategories.join(', ');
      } else if (formData.feeCategory) {
        feeCat = formData.feeCategory;
      }

      // Prepare the payload with properly formatted values
      const payload = {
        ...formData,
        feeCategory: feeCat,
        paymentDate: formattedDate,
        totalFees: parseFloat(formData.totalFees.toString()),
        amountPaid: parseFloat(formData.amountPaid.toString()),
        feeAmount: parseFloat(formData.feeAmount.toString())
      };
      
      // Call onUpdate with the updated record
      await onUpdate(payload as FeeRecord);
      toast.success('Fee record updated successfully');
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error('Error updating fee record:', error);
      
      // Handle error with proper type checking
      if (error && typeof error === 'object' && 'response' in error) {
        const serverError = error.response as { data?: { message?: string } };
        toast.error(serverError.data?.message || 'Failed to update fee record');
      } else {
        toast.error('Failed to update fee record');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate balance amount
  const balanceAmount = formData.totalFees - formData.amountPaid;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl relative z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Update Fee Record</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {classOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees</label>
                  <input
                    type="number"
                    name="totalFees"
                    value={formData.totalFees || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previously Paid Amount</label>
                  <input
                    disabled
                    type="number"
                    value={originalAmountPaid.toFixed(2)}
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Payment Amount</label>
                  <input
                    type="number"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount Paid</label>
                  <input
                    disabled
                    type="number"
                    value={formData.amountPaid.toFixed(2)}
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance Amount</label>
                  <input
                    disabled
                    type="number"
                    value={balanceAmount.toFixed(2)}
                    className={`w-full rounded-md border px-3 py-2 ${
                      balanceAmount > 0 ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Discount Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <div className="flex space-x-2">
                    <select
                      name="discountType"
                      value={formData.discountType && !customDiscountType ? formData.discountType : (customDiscountType ? 'other' : formData.discountType)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'other') {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: 'other' }));
                        } else {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: value }));
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Discount</option>
                      <option value="sibling_discount">Sibling Discount</option>
                      <option value="full_payment_discount">Full Payment Discount</option>
                      <option value="parent_employee_discount">Parent is Campus Employee</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="early_payment">Early Payment Discount</option>
                      <option value="financial_aid">Financial Aid</option>
                      <option value="other">Other</option>
                    </select>
                    {(formData.discountType === 'other' || customDiscountType) && (
                      <input
                        type="text"
                        placeholder="Specify discount name"
                        value={customDiscountType}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomDiscountType(value);
                          setFormData(prev => ({ 
                            ...prev, 
                            discountType: value || 'other'
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount || 0}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter discount percentage (0-100)"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!formData.discountType}
                  />
                  {formData.discountType && (formData.discountAmount || 0) > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Total Fee Amount:</span>
                        <span className="font-medium">₹{(formData.feeAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Discount ({formData.discountAmount}%):</span>
                        <span className="font-medium">- ₹{(formData.discountValue || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-green-600">
                        <span>Amount After Discount:</span>
                        <span>₹{(formData.amountAfterDiscount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Categories</label>
                  <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                    {feeCategories.map(category => (
                      <div key={category} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          id={`cat-${category}`}
                          checked={(formData.feeCategories || []).includes(category)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => {
                              // Get current categories or empty array
                              const currentCategories = prev.feeCategories || [];
                              
                              // Add or remove the category
                              const newCategories = isChecked
                                ? [...currentCategories, category]
                                : currentCategories.filter(c => c !== category);
                              
                              // Update form data with the new categories array
                              return {
                                ...prev,
                                feeCategories: newCategories,
                                // For backwards compatibility
                                feeCategory: newCategories.join(', ')
                              };
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-900">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Selected categories display */}
                  {(formData.feeCategories || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(formData.feeCategories || []).map(cat => (
                        <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateFeeRecord;