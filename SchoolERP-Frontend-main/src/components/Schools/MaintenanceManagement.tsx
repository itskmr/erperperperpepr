import React, { useState, useEffect } from 'react';
import { useTransport } from '../../contexts/TransportContext.jsx';
import { Plus, Edit, Trash2, Search, Filter, Calendar, Settings, Check, Clock, AlertTriangle, CheckCircle, DollarSign, Wrench, Tool } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  busId: string;
  date: string;
  type: 'regular' | 'repair' | 'inspection';
  description: string;
  cost: number;
  odometer: number;
  nextDueDate?: string;
  completedBy: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

const MaintenanceManagement: React.FC = () => {
  const {
    maintenanceRecords,
    buses,
    fetchMaintenanceRecords,
    fetchBuses,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    loading,
    error
  } = useTransport();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Load data on component mount
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchBuses();
  }, [fetchMaintenanceRecords, fetchBuses]);

  // Filter maintenance records based on search query, status filter, and type filter
  const filteredRecords = maintenanceRecords.filter((record) => {
    const bus = getBusDetails(record.busId);
    const busRegNumber = bus ? bus.registrationNumber : '';
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      busRegNumber.toLowerCase().includes(searchLower) ||
      record.type.toLowerCase().includes(searchLower) ||
      record.description.toLowerCase().includes(searchLower) ||
      record.completedBy.toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === '' || 
      record.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesType = 
      typeFilter === '' || 
      record.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddRecord = async (formData: Omit<MaintenanceRecord, 'id'>) => {
    await addMaintenance(formData);
    setIsAddModalOpen(false);
  };

  const handleEditRecord = async (id: string, formData: Partial<MaintenanceRecord>) => {
    await updateMaintenance(id, formData);
    setIsEditModalOpen(false);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      await deleteMaintenance(id);
    }
  };

  // Get bus details by busId
  const getBusDetails = (busId: string) => {
    return buses.find(bus => bus.id === busId);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'regular':
        return 'bg-indigo-100 text-indigo-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      case 'inspection':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if maintenance is overdue
  const isOverdue = (record: MaintenanceRecord) => {
    if (record.status === 'COMPLETED') return false;
    
    if (record.nextDueDate) {
      const dueDate = new Date(record.nextDueDate);
      const today = new Date();
      return dueDate < today;
    }
    
    return false;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Maintenance Management</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance Record
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by bus, type, or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="regular">Regular Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Maintenance records list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-sm text-gray-500">Loading maintenance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No maintenance records found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maintenance Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost & Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const bus = getBusDetails(record.busId);
                  const overdueStatus = isOverdue(record);
                  
                  return (
                    <tr key={record.id} className={overdueStatus ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {bus ? `${bus.registrationNumber}` : 'Unknown Bus'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bus ? `${bus.make} ${bus.model}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(record.type)}`}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(record.date)}
                          {record.nextDueDate && (
                            <span className="ml-2">
                              (Next: {formatDate(record.nextDueDate)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                            {record.status === 'SCHEDULED' && <Clock className="h-3 w-3 mr-1" />}
                            {record.status === 'IN_PROGRESS' && <Filter className="h-3 w-3 mr-1" />}
                            {record.status === 'COMPLETED' && <Check className="h-3 w-3 mr-1" />}
                            {record.status.charAt(0) + record.status.slice(1).toLowerCase().replace('_', ' ')}
                          </span>
                          {overdueStatus && (
                            <span className="ml-2 text-xs text-red-500 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          {record.cost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <Settings className="h-4 w-4 text-gray-400 mr-1" />
                          Odometer: {record.odometer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Maintenance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add Maintenance Record</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <MaintenanceForm 
                buses={buses} 
                onSubmit={handleAddRecord} 
                onCancel={() => setIsAddModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Maintenance Modal */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Maintenance Record</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <MaintenanceForm 
                record={selectedRecord}
                buses={buses}
                onSubmit={(data) => handleEditRecord(selectedRecord.id, data)}
                onCancel={() => setIsEditModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MaintenanceFormProps {
  record?: MaintenanceRecord;
  buses: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ record, buses, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    busId: record?.busId || '',
    date: record?.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: record?.type || 'regular',
    description: record?.description || '',
    cost: record?.cost || 0,
    odometer: record?.odometer || 0,
    nextDueDate: record?.nextDueDate ? new Date(record.nextDueDate).toISOString().split('T')[0] : '',
    completedBy: record?.completedBy || '',
    status: record?.status || 'SCHEDULED'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' 
        ? parseFloat(value) || 0
        : value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="busId" className="block text-sm font-medium text-gray-700">
          Bus
        </label>
        <select
          id="busId"
          name="busId"
          required
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.busId}
          onChange={handleChange}
        >
          <option value="">Select a bus</option>
          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.registrationNumber} - {bus.make} {bus.model}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Maintenance Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.date}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Maintenance Type
        </label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="regular">Regular Maintenance</option>
          <option value="repair">Repair</option>
          <option value="inspection">Inspection</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
            Cost
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="cost"
              id="cost"
              step="0.01"
              min="0"
              required
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              value={formData.cost}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="odometer" className="block text-sm font-medium text-gray-700">
            Odometer Reading
          </label>
          <input
            type="number"
            name="odometer"
            id="odometer"
            min="0"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.odometer}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-700">
          Next Due Date (if applicable)
        </label>
        <input
          type="date"
          name="nextDueDate"
          id="nextDueDate"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.nextDueDate}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="completedBy" className="block text-sm font-medium text-gray-700">
          Completed By
        </label>
        <input
          type="text"
          name="completedBy"
          id="completedBy"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.completedBy}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          required
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {record ? 'Update Record' : 'Add Record'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceManagement; 