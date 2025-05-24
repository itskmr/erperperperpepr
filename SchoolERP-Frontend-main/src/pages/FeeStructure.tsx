import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, Search, AlertTriangle, X } from 'lucide-react';
import { 
  ClassFeeStructure, 
  FeeCategory, 
  DEFAULT_CATEGORIES,
  calculateTotalAnnualFee 
} from '../types/FeeStructureTypes';
import { 
  Button, 
  Input, 
  Badge, 
  LoadingSpinner, 
  ErrorMessage,
  FilterSection
} from '../components/fee/FeeStructureComponents';
import * as feeStructureService from '../services/feeStructureService';

// Define class options for dropdown
const CLASS_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 (Science)',
  'Class 11 (Commerce)',
  'Class 11 (Arts)',
  'Class 12 (Science)',
  'Class 12 (Commerce)',
  'Class 12 (Arts)'
];

// Define frequency options
const FREQUENCY_OPTIONS = [
  'Monthly',
  'Bi-Monthly',
  'Quarterly',
  'Half-Yearly',
  'Term-Wise',
  'Yearly',
  'One-Time'
];

const FeeStructure = () => {
  const [feeStructures, setFeeStructures] = useState<ClassFeeStructure[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFrequency, setFilterFrequency] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortField, setSortField] = useState<string>('className');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState(0);
  const [newCategoryFrequency, setNewCategoryFrequency] = useState('Monthly');
  const [activeStructureId, setActiveStructureId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch fee categories from API
  useEffect(() => {
    setIsLoading(true);
    feeStructureService.getFeeCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setApiError("Failed to load fee categories. Using default categories.");
        setCategories(DEFAULT_CATEGORIES);
        setIsLoading(false);
      });
  }, []);

  // Fetch fee structures from API
  useEffect(() => {
    setIsLoading(true);
    feeStructureService.getFeeStructures()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Calculate totalAnnualFee for each structure if not set from backend
          const structuresWithTotal = data.map((structure: ClassFeeStructure) => ({
            ...structure,
            totalAnnualFee: structure.totalAnnualFee || calculateTotalAnnualFee(structure.categories)
          }));
          setFeeStructures(structuresWithTotal);
        } else {
          setApiError("No fee structures found in the database. Please add new classes.");
          setFeeStructures([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching fee structures:", err);
        setError("Failed to load fee structures from the server.");
        setFeeStructures([]);
        setIsLoading(false);
      });
  }, []);

  const handleAddStructure = async () => {
    if (!newClassName) {
      setError("Please select a class before adding");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsLoading(true);
    
    const formattedClassName = newClassName;

    const newStructure: ClassFeeStructure = {
      id: Date.now().toString(), // Temporary ID, will be replaced by backend
      className: formattedClassName,
      totalAnnualFee: 0,
      categories: []
    };
    
    try {
      // Add to API
      const result = await feeStructureService.createFeeStructure(newStructure);
      
      // If successful, add to state
      setFeeStructures(prev => [...prev, result]);
      setNewClassName('');
      setError(null);
    } catch (err) {
      console.error("Error adding fee structure:", err);
      setError("Failed to add fee structure. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      setIsLoading(true);
      // Try to delete from API first
      await feeStructureService.deleteFeeStructure(id);
      
      // Update local state
      setFeeStructures(feeStructures.filter(structure => structure.id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting fee structure:", err);
      setError("Failed to delete fee structure. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategoryClick = (structureId: string) => {
    if (categories.length === 0) {
      setError("No fee categories available to add");
      return;
    }

    setActiveStructureId(structureId);
    setNewCategoryName(categories[0]);
    setNewCategoryAmount(0);
    setNewCategoryFrequency('Monthly');
    setShowAddModal(true);
  };

  const handleAddCategory = async () => {
    if (!activeStructureId) return;
    
    setIsLoading(true);
    
    const newCategory: FeeCategory = {
      id: `${activeStructureId}-${Date.now()}`, // Temporary ID
      name: newCategoryName,
      amount: newCategoryAmount,
      frequency: newCategoryFrequency as any
    };

    const updatedStructures = feeStructures.map(structure =>
      structure.id === activeStructureId
        ? {
            ...structure,
            categories: [...structure.categories, newCategory],
            totalAnnualFee: calculateTotalAnnualFee([...structure.categories, newCategory])
          }
        : structure
    );
    
    setFeeStructures(updatedStructures);
    
    // Find the updated structure to sync with API
    const updatedStructure = updatedStructures.find(s => s.id === activeStructureId);
    if (updatedStructure) {
      try {
        await feeStructureService.updateFeeStructure(activeStructureId, updatedStructure);
        setError(null);
      } catch (err) {
        console.error("Failed to sync category addition with API:", err);
        setError("Failed to add fee category. Changes may not be saved.");
      } finally {
        setIsLoading(false);
        setShowAddModal(false);
        setActiveStructureId(null);
      }
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAddModal(false);
      }
    };

    if (showAddModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal]);

  const handleUpdateCategory = async (
    structureId: string,
    categoryId: string,
    updates: Partial<FeeCategory>
  ) => {
    setIsLoading(true);
    const updatedStructures = feeStructures.map(structure =>
      structure.id === structureId
        ? {
            ...structure,
            categories: structure.categories.map(category =>
              category.id === categoryId
                ? { ...category, ...updates }
                : category
            ),
            totalAnnualFee: calculateTotalAnnualFee(
              structure.categories.map(category =>
                category.id === categoryId
                  ? { ...category, ...updates }
                  : category
              )
            )
          }
        : structure
    );
    
    setFeeStructures(updatedStructures);
    
    // Find the updated structure to sync with API
    const updatedStructure = updatedStructures.find(s => s.id === structureId);
    if (updatedStructure) {
      try {
        await feeStructureService.updateFeeStructure(structureId, updatedStructure);
        setError(null);
      } catch (err) {
        console.error("Failed to sync category update with API:", err);
        setError("Failed to update fee category. Changes may not be saved.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (structureId: string, categoryId: string) => {
    setIsLoading(true);
    const updatedStructures = feeStructures.map(structure =>
      structure.id === structureId
        ? {
            ...structure,
            categories: structure.categories.filter(
              category => category.id !== categoryId
            ),
            totalAnnualFee: calculateTotalAnnualFee(
              structure.categories.filter(
                category => category.id !== categoryId
              )
            )
          }
        : structure
    );
    
    setFeeStructures(updatedStructures);
    
    // Find the updated structure to sync with API
    const updatedStructure = updatedStructures.find(s => s.id === structureId);
    if (updatedStructure) {
      try {
        await feeStructureService.updateFeeStructure(structureId, updatedStructure);
        setError(null);
      } catch (err) {
        console.error("Failed to sync category deletion with API:", err);
        setError("Failed to delete fee category. Changes may not be saved.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedStructures = feeStructures
    .filter(structure => {
      // Class name filter
      const matchesSearch = structure.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = !filterCategory || structure.categories.some(cat => cat.name === filterCategory);
      
      // Frequency filter
      const matchesFrequency = !filterFrequency || structure.categories.some(cat => cat.frequency === filterFrequency);
      
      return matchesSearch && matchesCategory && matchesFrequency;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortField === 'className') {
        const aClassName = a.className.toLowerCase();
        const bClassName = b.className.toLowerCase();
        
        if (sortDirection === 'asc') {
          return aClassName.localeCompare(bClassName);
        } else {
          return bClassName.localeCompare(aClassName);
        }
      } else if (sortField === 'totalAnnualFee') {
        if (sortDirection === 'asc') {
          return a.totalAnnualFee - b.totalAnnualFee;
        } else {
          return b.totalAnnualFee - a.totalAnnualFee;
        }
      }
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterFrequency('');
  };

  if (isLoading && feeStructures.length === 0) {
    return <LoadingSpinner message="Loading fee structures..." />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fee Structure Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage fee structures for different classes and their fee categories
            </p>
            {error && <ErrorMessage message={error} />}
            {apiError && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {apiError}
              </div>
            )}
          </div>
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                style={{ appearance: 'auto' }}
              >
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddStructure} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter section */}
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterFrequency={filterFrequency}
          setFilterFrequency={setFilterFrequency}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          categories={categories}
          clearFilters={clearFilters}
          toggleSort={toggleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          frequencyOptions={FREQUENCY_OPTIONS}
        />

        {/* Fee Structures List */}
        {filteredAndSortedStructures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No fee structures found.</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filterCategory || filterFrequency 
                ? "Try clearing your filters or add a new class." 
                : "Please add a new class to start managing fee structures."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedStructures.map((structure) => (
              <div key={structure.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{structure.className}</h2>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStructure(structure.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <span className="block text-sm text-indigo-600 mb-1">Total Annual Fee</span>
                      <span className="text-xl font-bold text-indigo-800">₹{structure.totalAnnualFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="block text-sm text-blue-600 mb-1">Categories</span>
                      <span className="text-xl font-bold text-blue-800">{structure.categories.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Fee Categories</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddCategoryClick(structure.id)}
                        disabled={isLoading}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Fee
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount (₹)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Frequency
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Annual Amount (₹)
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {structure.categories.map((category) => {
                            const isEditing = editingCategoryId === category.id;
                            const annualAmount = category.amount * 
                              (category.frequency === 'Monthly' ? 12 : 
                               category.frequency === 'Bi-Monthly' ? 6 :
                               category.frequency === 'Quarterly' ? 4 : 
                               category.frequency === 'Half-Yearly' ? 2 :
                               category.frequency === 'Term-Wise' ? 3 :
                               category.frequency === 'One-Time' ? 1 : 1);
                            
                            return (
                              <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {isEditing ? (
                                    <select
                                      value={category.name}
                                      onChange={(e) => 
                                        handleUpdateCategory(structure.id, category.id, { name: e.target.value })
                                      }
                                      className="border rounded-md p-1 w-full bg-white"
                                      style={{ appearance: 'auto' }}
                                    >
                                      {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="text-sm font-medium text-gray-900">
                                      {category.name}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      min="0"
                                      value={category.amount}
                                      onChange={(e) => 
                                        handleUpdateCategory(structure.id, category.id, { amount: Number(e.target.value) })
                                      }
                                      className="border rounded-md p-1 w-24"
                                    />
                                  ) : (
                                    <div className="text-sm text-gray-900">
                                      {category.amount.toLocaleString()}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {isEditing ? (
                                    <select
                                      value={category.frequency}
                                      onChange={(e) => 
                                        handleUpdateCategory(
                                          structure.id, 
                                          category.id, 
                                          { frequency: e.target.value as any }
                                        )
                                      }
                                      className="border rounded-md p-1 w-full bg-white"
                                      style={{ appearance: 'auto' }}
                                    >
                                      {FREQUENCY_OPTIONS.map(freq => (
                                        <option key={freq} value={freq}>{freq}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Badge color={
                                      category.frequency === 'Monthly' ? 'blue' :
                                      category.frequency === 'Bi-Monthly' ? 'cyan' :
                                      category.frequency === 'Quarterly' ? 'purple' :
                                      category.frequency === 'Half-Yearly' ? 'pink' :
                                      category.frequency === 'Term-Wise' ? 'orange' :
                                      category.frequency === 'One-Time' ? 'red' : 'green'
                                    }>
                                      {category.frequency}
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {annualAmount.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {isEditing ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingCategoryId(null)}
                                      disabled={isLoading}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingCategoryId(category.id)}
                                        disabled={isLoading}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(structure.id, category.id)}
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          
                          {structure.categories.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center">
                                  <AlertTriangle className="h-6 w-6 text-yellow-400 mb-2" />
                                  <p>No fee categories added yet.</p>
                                  <p className="mt-1 text-xs">Click "Add Fee" to add a category.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Fee Category</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ appearance: 'auto' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCategoryAmount}
                    onChange={(e) => setNewCategoryAmount(Number(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newCategoryFrequency}
                    onChange={(e) => setNewCategoryFrequency(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ appearance: 'auto' }}
                  >
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCategory}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Fee'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeStructure;


