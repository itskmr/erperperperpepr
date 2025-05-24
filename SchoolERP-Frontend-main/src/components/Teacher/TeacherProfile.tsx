import React from 'react';
import {  
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  MapPin,
  Briefcase,
  School,
  Heart,
  Flag,
  User2,
  Contact,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TeacherProfileProps {
  teacher?: {
    name: string;
    id: string;
    email: string;
    phone: string;
    designation: string;
    subjects: string[];
    classes: string;
    sections: {
      class: string;
      sections: string[];
    }[];
    joinDate: string;
    address: string;
    education: string;
    experience: string;
    profileImage?: string;
    isClassIncharge: boolean;
    inchargeClass?: string;
    inchargeSection?: string;
    personalInfo: {
      dateOfBirth: string;
      gender: string;
      bloodGroup: string;
      nationality: string;
      maritalStatus: string;
      emergencyContact: {
        name: string;
        relation: string;
        phone: string;
      };
    };
  };
}

const defaultTeacher = {
  name: "Rakesh Ruhil",
  id: "753789",
  email: "Rakeshruhil@gmail.com",
  phone: "8988277218",
  designation: "Senior Mathematics Teacher",
  subjects: ["Mathematics", "Physics"],
  classes: "9, 10, 11",
  sections: [
    { class: "9", sections: ["A", "B"] },
    { class: "10", sections: ["A"] },
    { class: "11", sections: ["A", "B", "C"] }
  ],
  joinDate: "2020-07-15",
  address: "123 Education Street, Teaching City",
  education: "M.Sc. Mathematics, B.Ed",
  experience: "8 years",
  profileImage: "https://randomuser.me/api/portraits/men/67.jpg",
  isClassIncharge: true,
  inchargeClass: "10",
  inchargeSection: "A",
  personalInfo: {
    dateOfBirth: "1985-07-15",
    gender: "Male",
    bloodGroup: "O+",
    nationality: "Indian",
    maritalStatus: "Married",
    emergencyContact: {
      name: "Marry Patel",
      relation: "Wife",
      phone: "9876543210"
    }
  }
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfileProps['teacher'];
  onSave: (data: any) => Promise<void>;
}

interface EditableFields {
  email: string;
  phone: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, teacher, onSave }) => {
  const [formData, setFormData] = React.useState<EditableFields>({
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    bloodGroup: teacher?.personalInfo.bloodGroup || '',
    emergencyContact: {
      name: teacher?.personalInfo.emergencyContact.name || '',
      relation: teacher?.personalInfo.emergencyContact.relation || '',
      phone: teacher?.personalInfo.emergencyContact.phone || ''
    }
  });

  React.useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        email: teacher.email,
        phone: teacher.phone,
        bloodGroup: teacher.personalInfo.bloodGroup,
        emergencyContact: {
          name: teacher.personalInfo.emergencyContact.name,
          relation: teacher.personalInfo.emergencyContact.relation,
          phone: teacher.personalInfo.emergencyContact.phone
        }
      });
    }
  }, [isOpen, teacher]);

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      toast.success('Profile updated successfully!');
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
          <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
    <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
    >
            <X className="h-5 w-5 text-gray-500" />
    </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Emergency Contact</h4>
            <div>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Contact Name"
                required
              />
              <input
                type="text"
                value={formData.emergencyContact.relation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Relation"
                required
              />
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
      </button>
      <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
      </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher: initialTeacher = defaultTeacher }) => {
  const [teacher, setTeacher] = React.useState(initialTeacher);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleSave = async (data: EditableFields) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTeacher(prev => ({
      ...prev,
      email: data.email,
      phone: data.phone,
      personalInfo: {
        ...prev.personalInfo,
        bloodGroup: data.bloodGroup,
        emergencyContact: {
          name: data.emergencyContact.name,
          relation: data.emergencyContact.relation,
          phone: data.emergencyContact.phone
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20 lg:pb-24">
            <div className="flex justify-between items-start max-w-4xl mx-auto">
              <h1 className="text-white text-base sm:text-lg lg:text-xl font-medium">Teacher Profile</h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 lg:-mt-16 pb-8 lg:pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full border-4 border-white shadow-xl overflow-hidden">
                      <img
                        src={teacher.profileImage || '/default-avatar.png'}
                        alt={teacher.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">{teacher.name}</h2>
                    <p className="text-lg text-emerald-600 font-medium mt-1">{teacher.designation}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                          <div className="flex items-center gap-2">
                            <span>{teacher.email}</span>
                          </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                          <div className="flex items-center gap-2">
                            <span>{teacher.phone}</span>
                          </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(teacher.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User2 className="h-5 w-5 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">
                          {new Date(teacher.personalInfo.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                      <div className="flex items-center gap-2">
                        <User2 className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.personalInfo.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Blood Group</h4>
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-emerald-400" />
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800">{teacher.personalInfo.bloodGroup}</span>
                          </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Nationality</h4>
                      <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.personalInfo.nationality}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Marital Status</h4>
                    <div className="flex items-center gap-2">
                      <User2 className="h-5 w-5 text-emerald-400" />
                      <span className="text-gray-800">{teacher.personalInfo.maritalStatus}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h4>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Contact className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.personalInfo.emergencyContact.name} ({teacher.personalInfo.emergencyContact.relation})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-emerald-400" />
                            <span className="text-gray-800">{teacher.personalInfo.emergencyContact.phone}</span>
                          </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Academic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Subjects Teaching</h4>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject, index) => (
                          <span 
                            key={index}
                            className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Classes & Sections</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {teacher.sections.map((item, index) => (
                          <div key={index} className="bg-emerald-50 rounded-lg p-3">
                            <div className="font-medium text-gray-800">Class {item.class}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Sections: {item.sections.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {teacher.isClassIncharge && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Class Incharge</h4>
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                          Class {teacher.inchargeClass} - Section {teacher.inchargeSection}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Education</h4>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.education}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Experience</h4>
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.experience}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-400" />
                        <span className="text-gray-800">{teacher.address}</span>
                      </div>
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
        teacher={teacher}
        onSave={handleSave}
      />
    </div>
  );
};

export default TeacherProfile;

// Example usage:

const mockTeacher = {
  name: "Kathryn Murphy",
  id: "753789",
  email: "kathryn.murphy@school.edu",
  phone: "8988277218",
  designation: "Senior Mathematics Teacher",
  subjects: ["Mathematics", "Physics"],
  classes: "9, 10, 11",
  sections: [
    { class: "9", sections: ["A", "B"] },
    { class: "10", sections: ["A"] },
    { class: "11", sections: ["A", "B", "C"] }
  ],
  joinDate: "2020-07-15",
  address: "123 Education Street, Teaching City",
  education: "M.Sc. Mathematics, B.Ed",
  experience: "8 years",
  profileImage: "/path/to/profile-image.jpg",
  isClassIncharge: true,
  inchargeClass: "10",
  inchargeSection: "A",
  personalInfo: {
    dateOfBirth: "1985-07-15",
    gender: "Female",
    bloodGroup: "O+",
    nationality: "Indian",
    maritalStatus: "Married",
    emergencyContact: {
      name: "John Murphy",
      relation: "Spouse",
      phone: "9876543210"
    }
  }
};

<TeacherProfile teacher={mockTeacher} />
