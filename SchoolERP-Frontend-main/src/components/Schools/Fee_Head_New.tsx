import { useState } from 'react';

interface FeeItem {
  srNo: number;
  Fee: string;
}

export const Fee_Head_New = () => {
  const initialFees: FeeItem[] = [
    { srNo: 1, Fee: 'Admission Fee' },
    { srNo: 2, Fee: 'Monthly Fee' },
    { srNo: 3, Fee: 'ID Card Fee' },
    { srNo: 4, Fee: 'Exam Fee' },
    { srNo: 5, Fee: 'Scout Guide Fee' },
    { srNo: 6, Fee: 'Board Exam Fee' },
    { srNo: 7, Fee: 'Board Registration Fee' },
    { srNo: 8, Fee: 'Practical Fee' },
    { srNo: 9, Fee: 'Party Fee' },
    { srNo: 10, Fee: 'Physical Edu. Fee' },
    { srNo: 11, Fee: 'Other Institute Fee' },
    { srNo: 12, Fee: 'Previous Session Due' },
    { srNo: 13, Fee: 'Tour Fee' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [fees, setFees] = useState<FeeItem[]>(initialFees);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFee, setCurrentFee] = useState<FeeItem | null>(null);
  const [newFeeName, setNewFeeName] = useState('');

  // Filter fees based on search term
  const filteredFees = fees.filter((item) =>
    `${item.srNo} ${item.Fee.toLowerCase()}`.includes(searchTerm.toLowerCase())
  );

  // Add a new fee
  const handleAddFee = () => {
    if (newFeeName.trim()) {
      const newFee = {
        srNo: fees.length + 1,
        Fee: newFeeName.trim(),
      };
      setFees([...fees, newFee]);
      setNewFeeName('');
      setIsAddModalOpen(false);
    }
  };

  // Edit a fee
  const handleEditFee = () => {
    if (currentFee && newFeeName.trim()) {
      const updatedFees = fees.map((item) =>
        item.srNo === currentFee.srNo ? { ...item, Fee: newFeeName.trim() } : item
      );
      setFees(updatedFees);
      setIsEditModalOpen(false);
      setCurrentFee(null);
      setNewFeeName('');
    }
  };

  // Delete a fee
  const handleDeleteFee = (srNo: number) => {
    const updatedFees = fees.filter((item) => item.srNo !== srNo);
    setFees(updatedFees);
  };

  // Open edit modal
  const openEditModal = (feeItem: FeeItem) => {
    setCurrentFee(feeItem);
    setNewFeeName(feeItem.Fee);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Fees</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            No. Of Records : {filteredFees.length}
          </span>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search fees..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="space-x-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setSearchTerm('')}
              >
                Filter
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Fee
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Sr No</th>
              <th className="border border-gray-300 px-4 py-2">Fee Name</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map((feeItem) => (
              <tr key={feeItem.srNo}>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {feeItem.srNo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {feeItem.Fee}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    onClick={() => openEditModal(feeItem)}
                  >
                    Modify
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDeleteFee(feeItem.srNo)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Fee</h2>
            <input
              type="text"
              placeholder="Enter fee name"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={newFeeName}
              onChange={(e) => setNewFeeName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleAddFee}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Fee</h2>
            <input
              type="text"
              placeholder="Enter fee name"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={newFeeName}
              onChange={(e) => setNewFeeName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={handleEditFee}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};