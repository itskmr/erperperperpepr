// AccreditationComponent.tsx
import React, { useState, useEffect } from 'react';
import { FiUpload, FiFile, FiTrash2, FiCheck, FiX, FiPlus, FiDownload } from 'react-icons/fi';

// Define types for our data structures
interface AccreditationBody {
  id: string;
  name: string;
  website: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Accreditation {
  id: string;
  accreditationBodyId: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  dateApplied: string;
  dateApproved?: string;
  validUntil?: string;
  certificateNumber?: string;
  documents: AccreditationDocument[];
  comments: AccreditationComment[];
}

interface AccreditationDocument {
  id: string;
  name: string;
  uploadDate: string;
  fileType: string;
  fileSize: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  url: string;
}

interface AccreditationComment {
  id: string;
  author: string;
  date: string;
  content: string;
}

const AccreditationComponent: React.FC = () => {
  // State for accreditation bodies and accreditations
  const [accreditationBodies, setAccreditationBodies] = useState<AccreditationBody[]>([]);
  const [accreditations, setAccreditations] = useState<Accreditation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  // State for the form
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [selectedBodyId, setSelectedBodyId] = useState<string>('');
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [comment, setComment] = useState<string>('');
 
  // State for selected accreditation details
  const [selectedAccreditation, setSelectedAccreditation] = useState<Accreditation | null>(null);

  // Mock data fetching - in a real app, this would be an API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
       
        // Mock data
        const mockAccreditationBodies: AccreditationBody[] = [
          {
            id: '1',
            name: 'National Education Accreditation Board',
            website: 'https://www.neab.org',
            contactPerson: 'John Smith',
            email: 'contact@neab.org',
            phone: '(555) 123-4567'
          },
          {
            id: '2',
            name: 'International School Standards Organization',
            website: 'https://www.isso.org',
            contactPerson: 'Jane Doe',
            email: 'info@isso.org',
            phone: '(555) 987-6543'
          }
        ];
       
        const mockAccreditations: Accreditation[] = [
          {
            id: '1',
            accreditationBodyId: '1',
            status: 'Approved',
            dateApplied: '2022-01-15',
            dateApproved: '2022-03-20',
            validUntil: '2027-03-20',
            certificateNumber: 'NEAB-2022-7845',
            documents: [
              {
                id: '1',
                name: 'Application Form',
                uploadDate: '2022-01-15',
                fileType: 'pdf',
                fileSize: 2500000,
                status: 'Approved',
                url: '/documents/application-form.pdf'
              },
              {
                id: '2',
                name: 'School Infrastructure Report',
                uploadDate: '2022-01-20',
                fileType: 'pdf',
                fileSize: 4200000,
                status: 'Approved',
                url: '/documents/infrastructure-report.pdf'
              }
            ],
            comments: [
              {
                id: '1',
                author: 'System',
                date: '2022-01-15',
                content: 'Application submitted'
              },
              {
                id: '2',
                author: 'John Smith',
                date: '2022-02-28',
                content: 'All requirements met. Approval recommended.'
              }
            ]
          },
          {
            id: '2',
            accreditationBodyId: '2',
            status: 'In Progress',
            dateApplied: '2022-06-10',
            documents: [
              {
                id: '3',
                name: 'Initial Application',
                uploadDate: '2022-06-10',
                fileType: 'pdf',
                fileSize: 1800000,
                status: 'Approved',
                url: '/documents/initial-application.pdf'
              }
            ],
            comments: [
              {
                id: '3',
                author: 'System',
                date: '2022-06-10',
                content: 'Application submitted'
              },
              {
                id: '4',
                author: 'Jane Doe',
                date: '2022-06-25',
                content: 'Additional documentation required. Please submit faculty qualifications.'
              }
            ]
          }
        ];

        setAccreditationBodies(mockAccreditationBodies);
        setAccreditations(mockAccreditations);
        setLoading(false);
      } catch (err) {
        setError('Failed to load accreditation data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle selecting an accreditation for detailed view
  const handleAccreditationSelect = (accreditation: Accreditation) => {
    setSelectedAccreditation(accreditation);
  };

  // Handle document file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files) {
      setNewDocument(event.target.files);
    }
  };

  // Handle document upload
  const handleDocumentUpload = () => {
    if (!newDocument || !selectedAccreditation) return;

    // In a real app, you would upload the file to a server here
    // For now, we'll just simulate adding it to the state
    const newDocumentEntry: AccreditationDocument = {
      id: Date.now().toString(),
      name: newDocument.name,
      uploadDate: new Date().toISOString().split('T'),
      fileType: newDocument.name.split('.').pop() || 'unknown',
      fileSize: newDocument.size,
      status: 'Pending',
      url: URL.createObjectURL(newDocument)
    };

    const updatedAccreditation = {
      ...selectedAccreditation,
      documents: [...selectedAccreditation.documents, newDocumentEntry]
    };

    setAccreditations(accreditations.map(acc => 
      acc.id === selectedAccreditation.id ? updatedAccreditation : acc
    ));
    setSelectedAccreditation(updatedAccreditation);
    setNewDocument(null);
    
    // Reset file input
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!comment || !selectedAccreditation) return;

    const newComment: AccreditationComment = {
      id: Date.now().toString(),
      author: 'Current User', // In a real app, this would be the logged-in user
      date: new Date().toISOString().split('T'),
      content: comment
    };

    const updatedAccreditation = {
      ...selectedAccreditation,
      comments: [...selectedAccreditation.comments, newComment]
    };

    setAccreditations(accreditations.map(acc => 
      acc.id === selectedAccreditation.id ? updatedAccreditation : acc
    ));
    setSelectedAccreditation(updatedAccreditation);
    setComment('');
  };

  // Handle starting a new accreditation application
  const handleStartNewApplication = () => {
    if (!selectedBodyId) return;

    const newAccreditation: Accreditation = {
      id: Date.now().toString(),
      accreditationBodyId: selectedBodyId,
      status: 'Pending',
      dateApplied: new Date().toISOString().split('T'),
      documents: [],
      comments: [
        {
          id: Date.now().toString(),
          author: 'System',
          date: new Date().toISOString().split('T'),
          content: 'Application initiated'
        }
      ]
    };

    setAccreditations([...accreditations, newAccreditation]);
    setIsAddingNew(false);
    setSelectedBodyId('');
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get accreditation body name by ID
  const getBodyNameById = (id: string): string => {
    const body = accreditationBodies.find(body => body.id === id);
    return body ? body.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Accreditation Management</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> New Application
        </button>
      </div>

      {/* New Application Form */}
      {isAddingNew && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">New Accreditation Application</h3>
          <div className="mb-4">
            <label htmlFor="accreditation-body" className="block text-sm font-medium text-gray-700 mb-1">
              Accreditation Body
            </label>
            <select
              id="accreditation-body"
              value={selectedBodyId}
              onChange={(e) => setSelectedBodyId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an accreditation body</option>
              {accreditationBodies.map(body => (
                <option key={body.id} value={body.id}>{body.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddingNew(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleStartNewApplication}
              disabled={!selectedBodyId}
              className={`px-4 py-2 rounded-md ${
                selectedBodyId
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-300 cursor-not-allowed text-white'
              }`}
            >
              Start Application
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accreditation List */}
        <div className="md:col-span-1 border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">Accreditations</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {accreditations.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No accreditations found</div>
            ) : (
              accreditations.map(accreditation => (
                <div
                  key={accreditation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition duration-150 ${
                    selectedAccreditation?.id === accreditation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleAccreditationSelect(accreditation)}
                >
                  <div className="font-medium">{getBodyNameById(accreditation.accreditationBodyId)}</div>
                  <div className="text-sm text-gray-600">Applied: {accreditation.dateApplied}</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          accreditation.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : accreditation.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : accreditation.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {accreditation.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accreditation Details */}
        <div className="md:col-span-2 border border-gray-200 rounded-md">
          {selectedAccreditation ? (
            <div>
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold">
                  {getBodyNameById(selectedAccreditation.accreditationBodyId)} - Accreditation Details
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`font-medium ${
                        selectedAccreditation.status === 'Approved'
                          ? 'text-green-600'
                          : selectedAccreditation.status === 'Rejected'
                          ? 'text-red-600'
                          : selectedAccreditation.status === 'In Progress'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {selectedAccreditation.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Applied</p>
                    <p className="font-medium">{selectedAccreditation.dateApplied}</p>
                  </div>
                  {selectedAccreditation.dateApproved && (
                    <div>
                      <p className="text-sm text-gray-500">Date Approved</p>
                      <p className="font-medium">{selectedAccreditation.dateApproved}</p>
                    </div>
                  )}
                  {selectedAccreditation.validUntil && (
                    <div>
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p className="font-medium">{selectedAccreditation.validUntil}</p>
                    </div>
                  )}
                  {selectedAccreditation.certificateNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Certificate Number</p>
                      <p className="font-medium">{selectedAccreditation.certificateNumber}</p>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 pb-2 border-b border-gray-200">Documents</h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
                    {selectedAccreditation.documents.length === 0 ? (
                      <p className="text-gray-500">No documents uploaded yet</p>
                    ) : (
                      selectedAccreditation.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FiFile className="text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.fileSize)} • Uploaded on {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                ${
                                  doc.status === 'Approved'
                                    ? 'bg-green-100 text-green-800'
                                    : doc.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              `}
                            >
                              {doc.status}
                            </span>
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              title="Download document"
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex items-end space-x-3">
                    <div className="flex-grow">
                      <label 
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="document-upload"
                      >
                        Upload New Document
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          id="document-upload"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer flex items-center justify-center border border-gray-300 rounded-md py-2 px-3 bg-white hover:bg-gray-50 transition duration-300"
                        >
                          <FiUpload className="mr-2" />
                          <span>{newDocument ? newDocument.name : 'Choose file...'}</span>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleDocumentUpload}
                      disabled={!newDocument}
                      className={`py-2 px-4 rounded-md text-sm transition duration-300 ${
                        newDocument
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 cursor-not-allowed text-gray-500'
                      }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="font-semibold mb-3 pb-2 border-b border-gray-200">Comments</h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
                    {selectedAccreditation.comments.length === 0 ? (
                      <p className="text-gray-500">No comments yet</p>
                    ) : (
                      selectedAccreditation.comments.map(comment => (
                        <div key={comment.id} className="p-2 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{comment.author}</p>
                            <p className="text-xs text-gray-500">{comment.date}</p>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Add Comment
                    </label>
                    <div className="flex space-x-3">
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your comment here..."
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!comment}
                        className={`self-end py-2 px-4 rounded-md text-sm transition duration-300 ${
                          comment
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-200 cursor-not-allowed text-gray-500'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p>Select an accreditation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccreditationComponent;