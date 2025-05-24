import React from 'react';
import { 
  Account, 
  AccountType, 
  ClassLevel, 
  AccountFormData
} from '../types/AccountTypes';

interface AccountFormProps {
  formData: AccountFormData;
  selectedAccount: Account | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  selectedAccount,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedAccount ? 'Edit Account' : 'Add New Account'}
            </h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
              type="button"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter account name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={AccountType.INCOME}>{AccountType.INCOME}</option>
                <option value={AccountType.EXPENSE}>{AccountType.EXPENSE}</option>
                <option value={AccountType.ASSETS}>{AccountType.ASSETS}</option>
                <option value={AccountType.LIABILITY}>{AccountType.LIABILITY}</option>
              </select>
            </div>

            <div>
              <label htmlFor="associatedClass" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Class
              </label>
              <select
                id="associatedClass"
                name="associatedClass"
                value={formData.associatedClass}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={ClassLevel.NONE}>None</option>
                <option value={ClassLevel.ALL_CLASSES}>All Classes</option>
                <option value={ClassLevel.NURSERY}>{ClassLevel.NURSERY}</option>
                <option value={ClassLevel.PREP}>{ClassLevel.PREP}</option>
                <option value={ClassLevel.CLASS_1}>{ClassLevel.CLASS_1}</option>
                <option value={ClassLevel.CLASS_2}>{ClassLevel.CLASS_2}</option>
                <option value={ClassLevel.CLASS_3}>{ClassLevel.CLASS_3}</option>
                <option value={ClassLevel.CLASS_4}>{ClassLevel.CLASS_4}</option>
                <option value={ClassLevel.CLASS_5}>{ClassLevel.CLASS_5}</option>
                <option value={ClassLevel.CLASS_6}>{ClassLevel.CLASS_6}</option>
                <option value={ClassLevel.CLASS_7}>{ClassLevel.CLASS_7}</option>
                <option value={ClassLevel.CLASS_8}>{ClassLevel.CLASS_8}</option>
                <option value={ClassLevel.CLASS_9}>{ClassLevel.CLASS_9}</option>
                <option value={ClassLevel.CLASS_10}>{ClassLevel.CLASS_10}</option>
                <option value={ClassLevel.CLASS_11}>{ClassLevel.CLASS_11}</option>
                <option value={ClassLevel.CLASS_12}>{ClassLevel.CLASS_12}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="opBalance" className="block text-sm font-medium text-gray-700 mb-1">
                Opening Balance
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  id="opBalance"
                  name="opBalance"
                  value={formData.opBalance}
                  onChange={onInputChange}
                  className="w-full border border-gray-300 rounded-md pl-7 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter account description"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => 
                  onInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'isActive',
                      value: e.target.checked.toString()
                    }
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Account
              </label>
            </div>

            {selectedAccount && (
              <div className="text-xs text-gray-500 mt-2">
                <p>Created: {new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
                {selectedAccount.lastUpdated && (
                  <p>Last Updated: {new Date(selectedAccount.lastUpdated).toLocaleDateString()}</p>
                )}
              </div>
            )}

          </div>
          
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedAccount ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm; 