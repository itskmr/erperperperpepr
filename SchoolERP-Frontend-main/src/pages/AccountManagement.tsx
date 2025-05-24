import React, { useState } from 'react';

// Define TypeScript interfaces and types
export enum AccountType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  ASSETS = 'Assets'
}

export interface Account {
  id: number;
  accountName: string;
  accountType: AccountType;
  opBalance: number;
}

interface AccountFormData {
  accountName: string;
  accountType: AccountType;
  opBalance: number;
}

const initialAccounts: Account[] = [
  { id: 1, accountName: 'Application Form', accountType: AccountType.INCOME, opBalance: 500.00 },
  { id: 2, accountName: 'Admission', accountType: AccountType.INCOME, opBalance: 200.00 },
  { id: 3, accountName: 'Cash', accountType: AccountType.ASSETS, opBalance: 0.00 },
  { id: 4, accountName: 'Fee Submission', accountType: AccountType.INCOME, opBalance: 0.00 },
  { id: 5, accountName: 'Item Purchase', accountType: AccountType.EXPENSE, opBalance: 0.00 },
  { id: 6, accountName: 'Item Sale', accountType: AccountType.INCOME, opBalance: 0.00 },
  { id: 7, accountName: 'Readmission', accountType: AccountType.INCOME, opBalance: 0.00 },
  { id: 8, accountName: 'Guard Salary', accountType: AccountType.EXPENSE, opBalance: 0.00 },
  { id: 9, accountName: 'Online', accountType: AccountType.INCOME, opBalance: 5000.00 }
];

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: '',
    accountType: AccountType.INCOME,
    opBalance: 0
  });
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add new account
  const handleAddAccount = (): void => {
    if (!formData.accountName.trim()) {
      alert('Account name is required');
      return;
    }
    
    const newAccount: Account = {
      ...formData,
      id: accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1
    };
    setAccounts([...accounts, newAccount]);
    resetForm();
  };

  // Update existing account
  const handleUpdateAccount = (): void => {
    if (!formData.accountName.trim()) {
      alert('Account name is required');
      return;
    }
    
    if (selectedAccount) {
      setAccounts(accounts.map(acc => 
        acc.id === selectedAccount.id ? { ...formData, id: selectedAccount.id } : acc
      ));
      resetForm();
    }
  };

  // Delete account
  const handleDeleteAccount = (id: number): void => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  // Edit account
  const handleEditAccount = (account: Account): void => {
    setSelectedAccount(account);
    setFormData({
      accountName: account.accountName,
      accountType: account.accountType,
      opBalance: account.opBalance
    });
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = (): void => {
    setFormData({
      accountName: '',
      accountType: AccountType.INCOME,
      opBalance: 0
    });
    setSelectedAccount(null);
    setIsModalOpen(false);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'opBalance' ? parseFloat(value) || 0 : value
    }));
  };

  // Filter accounts based on search and filter criteria
  const filteredAccounts = accounts.filter(account => {
    const matchesType = filterType ? account.accountType === filterType : true;
    const matchesSearch = searchTerm 
      ? account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // Calculate totals
  const totalOpBalance = filteredAccounts.reduce((sum, account) => sum + account.opBalance, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your financial accounts efficiently</p>
        </div>
        
        {/* Controls and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-150 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Account
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value={AccountType.INCOME}>{AccountType.INCOME}</option>
                <option value={AccountType.EXPENSE}>{AccountType.EXPENSE}</option>
                <option value={AccountType.ASSETS}>{AccountType.ASSETS}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Balance</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account, index) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.accountName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${account.accountType === AccountType.INCOME ? 'bg-green-100 text-green-800' : 
                          account.accountType === AccountType.EXPENSE ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {account.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {account.opBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button 
                        onClick={() => handleEditAccount(account)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Total:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">{totalOpBalance.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredAccounts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType ? 
                  'Try adjusting your search or filter to find what you\'re looking for.' : 
                  'Get started by creating a new account.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedAccount ? 'Edit Account' : 'Add New Account'}
                </h3>
                <button 
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              selectedAccount ? handleUpdateAccount() : handleAddAccount();
            }}>
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={AccountType.INCOME}>{AccountType.INCOME}</option>
                    <option value={AccountType.EXPENSE}>{AccountType.EXPENSE}</option>
                    <option value={AccountType.ASSETS}>{AccountType.ASSETS}</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="opBalance" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    id="opBalance"
                    name="opBalance"
                    value={formData.opBalance}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
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
      )}
    </div>
  );
};

export default AccountManagement;