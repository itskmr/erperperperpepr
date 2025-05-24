import React from 'react';
import { 
  Building2,
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Globe,
  Users,
  GraduationCap,
  School,
  ClipboardList,
  Contact,
  Edit2,
  Save,
  X,
  User2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SchoolProfileProps {
  school?: {
    name: string;
    id: string;
    email: string;
    phone: string;
    website: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    establishedYear: string;
    type: string; // e.g., "Public", "Private"
    boardAffiliation: string; // e.g., "CBSE", "ICSE"
    principalName: string;
    facilities: string[];
    stats: {
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      averageClassSize: number;
    };
    contactInfo: {
      adminEmail: string;
      adminPhone: string;
      emergencyContact: string;
    };
    logo?: string;
  };
}

const defaultSchool = {
  name: "Delhi Public School",
  id: "DPS123",
  email: "info@dps.edu",
  phone: "011-12345678",
  website: "www.dps.edu",
  address: {
    street: "123 Education Lane",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001"
  },
  establishedYear: "1972",
  type: "Private",
  boardAffiliation: "CBSE",
  principalName: "Dr. Rajesh Kumar",
  facilities: [
    "Computer Lab",
    "Science Labs",
    "Library",
    "Sports Complex",
    "Auditorium",
    "Smart Classrooms"
  ],
  stats: {
    totalStudents: 5000,
    totalTeachers: 100,
    totalClasses: 60,
    averageClassSize: 30
  },
  contactInfo: {
    adminEmail: "admin@dps.edu",
    adminPhone: "011-87654321",
    emergencyContact: "011-99999999"
  },
  logo: "https://example.com/school-logo.png"
};

interface EditableFields {
  email: string;
  phone: string;
  website: string;
  contactInfo: {
    adminEmail: string;
    adminPhone: string;
    emergencyContact: string;
  };
}

const EditProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfileProps['school'];
  onSave: (data: EditableFields) => Promise<void>;
}> = ({ isOpen, onClose, school, onSave }) => {
  const [formData, setFormData] = React.useState<EditableFields>({
    email: school?.email || '',
    phone: school?.phone || '',
    website: school?.website || '',
    contactInfo: {
      adminEmail: school?.contactInfo.adminEmail || '',
      adminPhone: school?.contactInfo.adminPhone || '',
      emergencyContact: school?.contactInfo.emergencyContact || ''
    }
  });

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && school) {
      setFormData({
        email: school.email,
        phone: school.phone,
        website: school.website,
        contactInfo: { ...school.contactInfo }
      });
    }
  }, [isOpen, school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      toast.success('School profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Edit School Profile</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
            <div>
              <input
                type="email"
                value={formData.contactInfo.adminEmail}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, adminEmail: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                placeholder="Admin Email"
                required
              />
              <input
                type="tel"
                value={formData.contactInfo.adminPhone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, adminPhone: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                placeholder="Admin Phone"
                required
              />
              <input
                type="tel"
                value={formData.contactInfo.emergencyContact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, emergencyContact: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Emergency Contact"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SchoolProfile: React.FC<SchoolProfileProps> = ({ school: initialSchool = defaultSchool }) => {
  const [school, setSchool] = React.useState(initialSchool);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleSave = async (data: EditableFields) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSchool(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20 lg:pb-24">
            <div className="flex justify-between items-start max-w-4xl mx-auto">
              <h1 className="text-white text-base sm:text-lg lg:text-xl font-medium">School Profile</h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 lg:-mt-16 pb-8 lg:pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* School Header */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* School Logo */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-xl border-4 border-white shadow-xl overflow-hidden">
                      <img
                        src={school.logo || '/default-school-logo.png'}
                        alt={school.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">{school.name}</h2>
                    <p className="text-lg text-blue-600 font-medium mt-1">{school.boardAffiliation} Affiliated</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{school.email}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{school.phone}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a href={`https://${school.website}`} className="text-blue-600 hover:underline">
                          {school.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* School Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{school.stats.totalStudents}</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <GraduationCap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{school.stats.totalTeachers}</div>
                  <div className="text-sm text-gray-500">Teachers</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <School className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{school.stats.totalClasses}</div>
                  <div className="text-sm text-gray-500">Classes</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{school.stats.averageClassSize}</div>
                  <div className="text-sm text-gray-500">Avg. Class Size</div>
                </div>
              </div>

              {/* School Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    General Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                        <span className="text-gray-800">
                          {school.address.street}, {school.address.city}, {school.address.state} - {school.address.pincode}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Established</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-800">{school.establishedYear}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Principal</h4>
                      <div className="flex items-center gap-2">
                        <User2 className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-800">{school.principalName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {school.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Contact className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Admin Email</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-800">{school.contactInfo.adminEmail}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Admin Phone</h4>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-800">{school.contactInfo.adminPhone}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Emergency Contact</h4>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-800">{school.contactInfo.emergencyContact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        school={school}
        onSave={handleSave}
      />
    </div>
  );
};

export default SchoolProfile;
