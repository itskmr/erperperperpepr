import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiShield } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  bio?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewUser = id === 'new';
  
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'teacher',
    status: 'active',
    phone: '',
    address: '',
    bio: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(!isNewUser);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (isNewUser) return;
      
      setIsLoading(true);
      try {
        // In a real app, fetch from your API
        // Simulating API call with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUser: User = {
          id: id || '1',
          name: `User ${id}`,
          email: `user${id}@example.com`,
          role: id === '1' ? 'admin' : (id === '2' ? 'school' : 'teacher'),
          status: 'active',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, Anytown, USA',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        };
        
        setFormData(mockUser);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id, isNewUser]);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // In a real app, send to your API
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to users list or user profile
      navigate(isNewUser ? '/users' : `/users/${id}`);
    } catch (err) {
      console.error('Error saving user:', err);
      setSaveError('Failed to save user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNewUser ? 'Create New User' : 'Edit User'}
        </h1>
        <Link 
          to={isNewUser ? '/users' : `/users/${id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiX />
          <span>Cancel</span>
        </Link>
      </div>
      
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {saveError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShield className="text-gray-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3 appearance-none`}
                >
                  <option value="admin">Admin</option>
                  <option value="school">School</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3 appearance-none`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${
                                      errors.phone ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3`}
                                    placeholder="Enter phone number"
                                  />
                                </div>
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                              </div>
                              
                              <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                  Address
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMapPin className="text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    className={`pl-10 w-full rounded-lg border ${
                                      errors.address ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3`}
                                    placeholder="Enter address"
                                  />
                                </div>
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
                            
                            <div>
                              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                              </label>
                              <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                  <FiFileText className="text-gray-400" />
                                </div>
                                <textarea
                                  id="bio"
                                  name="bio"
                                  rows={4}
                                  value={formData.bio || ''}
                                  onChange={handleChange}
                                  className={`pl-10 w-full rounded-lg border ${
                                    errors.bio ? 'border-red-500' : 'border-gray-300'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3`}
                                  placeholder="Enter bio information"
                                ></textarea>
                              </div>
                              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
                            </div>
                          </div>
                          
                          <div className="p-6 flex justify-end gap-4">
                            <Link
                              to={isNewUser ? '/users' : `/users/${id}`}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FiX />
                              <span>Cancel</span>
                            </Link>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ${
                                isSaving ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              <FiSave />
                              <span>{isSaving ? 'Saving...' : 'Save User'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  };
                  
                  export default UserEdit;