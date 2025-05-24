import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  User, 
  File, 
  FilePlus,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Document types and statuses
type DocumentStatus = "verified" | "pending" | "rejected" | "expired";
type DocumentCategory = "identification" | "qualification" | "certification" | "contract" | "evaluation";

interface StaffDocument {
  id: string;
  name: string;
  staffName: string;
  staffId: string;
  category: DocumentCategory;
  uploadDate: string;
  expiryDate?: string;
  status: DocumentStatus;
  fileType: string;
  fileSize: string;
  description?: string;
  tags?: string[];
}

const StaffDocumentManagement: React.FC = () => {
  // State management
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StaffDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: keyof StaffDocument, direction: 'ascending' | 'descending'} | null>(null);
  
  const documentsPerPage = 8;

  // Mock data for staff documents
  const mockDocuments: StaffDocument[] = [
    {
      id: "DOC-001",
      name: "Teaching Certificate",
      staffName: "John Smith",
      staffId: "STAFF-001",
      category: "certification",
      uploadDate: "2023-05-15",
      expiryDate: "2025-05-15",
      status: "verified",
      fileType: "PDF",
      fileSize: "2.4 MB",
      description: "State teaching certification for secondary education",
      tags: ["teaching", "certification", "secondary"]
    },
    {
      id: "DOC-002",
      name: "Master's Degree Certificate",
      staffName: "Sarah Johnson",
      staffId: "STAFF-002",
      category: "qualification",
      uploadDate: "2023-04-10",
      status: "verified",
      fileType: "PDF",
      fileSize: "3.1 MB",
      description: "Master's degree in Mathematics from Stanford University",
      tags: ["education", "qualification", "mathematics"]
    },
    {
      id: "DOC-003",
      name: "Employment Contract",
      staffName: "Michael Brown",
      staffId: "STAFF-003",
      category: "contract",
      uploadDate: "2023-06-01",
      expiryDate: "2024-05-31",
      status: "verified",
      fileType: "PDF",
      fileSize: "1.8 MB",
      description: "Annual employment contract for the 2023-2024 academic year",
      tags: ["contract", "employment", "legal"]
    },
    {
      id: "DOC-004",
      name: "Background Check",
      staffName: "Emily Davis",
      staffId: "STAFF-004",
      category: "identification",
      uploadDate: "2023-05-20",
      status: "pending",
      fileType: "PDF",
      fileSize: "4.2 MB",
      description: "Criminal background check for new staff member",
      tags: ["background", "verification", "security"]
    },
    {
      id: "DOC-005",
      name: "Performance Evaluation",
      staffName: "Robert Wilson",
      staffId: "STAFF-005",
      category: "evaluation",
      uploadDate: "2023-03-15",
      status: "verified",
      fileType: "PDF",
      fileSize: "1.5 MB",
      description: "Annual performance evaluation for 2022-2023 academic year",
      tags: ["evaluation", "performance", "annual"]
    },
    {
      id: "DOC-006",
      name: "Professional Development Certificate",
      staffName: "Jennifer Lee",
      staffId: "STAFF-006",
      category: "certification",
      uploadDate: "2023-02-28",
      expiryDate: "2026-02-28",
      status: "verified",
      fileType: "PDF",
      fileSize: "1.2 MB",
      description: "Certificate for completing advanced teaching methodologies course",
      tags: ["professional development", "training", "teaching"]
    },
    {
      id: "DOC-007",
      name: "ID Card Photo",
      staffName: "David Martinez",
      staffId: "STAFF-007",
      category: "identification",
      uploadDate: "2023-06-10",
      status: "verified",
      fileType: "JPG",
      fileSize: "0.8 MB",
      description: "Official photo for staff ID card",
      tags: ["photo", "identification", "ID"]
    },
    {
      id: "DOC-008",
      name: "Medical Certificate",
      staffName: "Lisa Thompson",
      staffId: "STAFF-008",
      category: "certification",
      uploadDate: "2023-05-05",
      expiryDate: "2024-05-05",
      status: "verified",
      fileType: "PDF",
      fileSize: "2.0 MB",
      description: "Annual medical fitness certificate",
      tags: ["medical", "health", "certification"]
    },
    {
      id: "DOC-009",
      name: "Previous Employment Verification",
      staffName: "Kevin Anderson",
      staffId: "STAFF-009",
      category: "identification",
      uploadDate: "2023-04-20",
      status: "rejected",
      fileType: "PDF",
      fileSize: "3.5 MB",
      description: "Verification of previous employment history",
      tags: ["employment", "verification", "history"]
    },
    {
      id: "DOC-010",
      name: "Special Education Certification",
      staffName: "Michelle Garcia",
      staffId: "STAFF-010",
      category: "certification",
      uploadDate: "2022-12-15",
      expiryDate: "2023-12-15",
      status: "expired",
      fileType: "PDF",
      fileSize: "2.2 MB",
      description: "Certification for special education teaching",
      tags: ["special education", "certification", "teaching"]
    },
    {
      id: "DOC-011",
      name: "Passport Copy",
      staffName: "James Wilson",
      staffId: "STAFF-011",
      category: "identification",
      uploadDate: "2023-01-10",
      expiryDate: "2028-01-09",
      status: "verified",
      fileType: "PDF",
      fileSize: "1.7 MB",
      description: "Copy of passport for international staff member",
      tags: ["passport", "identification", "international"]
    },
    {
      id: "DOC-012",
      name: "Probation Review",
      staffName: "Patricia Moore",
      staffId: "STAFF-012",
      category: "evaluation",
      uploadDate: "2023-06-15",
      status: "pending",
      fileType: "PDF",
      fileSize: "1.3 MB",
      description: "Three-month probation period review",
      tags: ["probation", "review", "evaluation"]
    }
  ];

  // Initialize documents on component mount
  useEffect(() => {
    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, []);

  // Filter documents based on search term, category, and status
  useEffect(() => {
    let results = documents;
    
    if (searchTerm) {
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      results = results.filter(doc => doc.category === selectedCategory);
    }
    
    if (selectedStatus) {
      results = results.filter(doc => doc.status === selectedStatus);
    }
    
    // Apply sorting if configured
    if (sortConfig) {
      results = [...results].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredDocuments(results);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, documents, sortConfig]);

  // Calculate pagination
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  // Handle document view
  const handleViewDocument = (document: StaffDocument) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  // Handle document sorting
  const requestSort = (key: keyof StaffDocument) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get status badge style
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  // Get category label
  const getCategoryLabel = (category: DocumentCategory) => {
    switch (category) {
      case "identification":
        return "Identification";
      case "qualification":
        return "Qualification";
      case "certification":
        return "Certification";
      case "contract":
        return "Contract";
      case "evaluation":
        return "Evaluation";
      default:
        return "Other";
    }
  };

  // Get category icon
  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case "identification":
        return <User className="h-4 w-4 text-blue-600" />;
      case "qualification":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "certification":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "contract":
        return <File className="h-4 w-4 text-orange-600" />;
      case "evaluation":
        return <BarChart className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Document Management</h1>
          <p className="text-gray-600 mt-1">Manage, track, and verify staff documents</p>
        </div>
        
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search documents, staff name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="identification">Identification</option>
                <option value="qualification">Qualification</option>
                <option value="certification">Certification</option>
                <option value="contract">Contract</option>
                <option value="evaluation">Evaluation</option>
              </select>
            </div>
            
            <div className="w-full sm:w-48">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('name')}
              >
                Document
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('staffName')}
              >
                Staff
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('category')}
              >
                Category
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('uploadDate')}
              >
                Upload Date
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('status')}
              >
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDocuments.length > 0 ? (
              currentDocuments.map((document) => (
                <motion.tr 
                  key={document.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-md">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{document.name}</div>
                        <div className="text-sm text-gray-500">{document.id} • {document.fileType} • {document.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.staffName}</div>
                    <div className="text-sm text-gray-500">{document.staffId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(document.category)}
                      <span className="ml-1.5 text-sm text-gray-900">{getCategoryLabel(document.category)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      {document.uploadDate}
                    </div>
                    {document.expiryDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        Expires: {document.expiryDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(document.status)}`}>
                      {getStatusIcon(document.status)}
                      <span className="ml-1 capitalize">{document.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewDocument(document)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FilePlus className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredDocuments.length > documentsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstDocument + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastDocument, filteredDocuments.length)}
                </span>{" "}
                of <span className="font-medium">{filteredDocuments.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Document View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedDocument && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedDocument.name}
                      </h3>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedDocument.status)}`}>
                            {getStatusIcon(selectedDocument.status)}
                            <span className="ml-1 capitalize">{selectedDocument.status}</span>
                          </span>
                          
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getCategoryIcon(selectedDocument.category)}
                            <span className="ml-1">{getCategoryLabel(selectedDocument.category)}</span>
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Document Details</h4>
                              <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">ID:</span> {selectedDocument.id}
                                </p>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">File Type:</span> {selectedDocument.fileType}
                                </p>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">File Size:</span> {selectedDocument.fileSize}
                                </p>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">Upload Date:</span> {selectedDocument.uploadDate}
                                </p>
                                {selectedDocument.expiryDate && (
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Expiry Date:</span> {selectedDocument.expiryDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Staff Information</h4>
                              <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">Name:</span> {selectedDocument.staffName}
                                </p>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">ID:</span> {selectedDocument.staffId}
                                </p>
                              </div>
                            </div>
                          </div>
                             



                          {selectedDocument.description && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-500">Description</h4>
                              <p className="mt-1 text-sm text-gray-900">{selectedDocument.description}</p>
                            </div>
                          )}
                          
                          {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {selectedDocument.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="h-16 w-16 text-indigo-600 mx-auto" />
                              <p className="mt-2 text-sm font-medium text-gray-900">Document Preview</p>
                              <p className="text-xs text-gray-500">Click to view full document</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Upload Document Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Upload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Upload New Document
                      </h3>
                      <div className="mt-4">
                        <form className="space-y-4">
                          <div>
                            <label htmlFor="document-name" className="block text-sm font-medium text-gray-700">
                              Document Name
                            </label>
                            <input
                              type="text"
                              id="document-name"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter document name"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="staff-select" className="block text-sm font-medium text-gray-700">
                              Select Staff Member
                            </label>
                            <select
                              id="staff-select"
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select a staff member</option>
                              <option value="STAFF-001">John Smith (STAFF-001)</option>
                              <option value="STAFF-002">Sarah Johnson (STAFF-002)</option>
                              <option value="STAFF-003">Michael Brown (STAFF-003)</option>
                              <option value="STAFF-004">Emily Davis (STAFF-004)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
                              Document Category
                            </label>
                            <select
                              id="category-select"
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select a category</option>
                              <option value="identification">Identification</option>
                              <option value="qualification">Qualification</option>
                              <option value="certification">Certification</option>
                              <option value="contract">Contract</option>
                              <option value="evaluation">Evaluation</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
                              Expiry Date (if applicable)
                            </label>
                            <input
                              type="date"
                              id="expiry-date"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="document-description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id="document-description"
                              rows={3}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter document description"
                            ></textarea>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Upload File
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                  >
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, DOCX, JPG, PNG up to 10MB
                                </p>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add missing icons
const BarChart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default StaffDocumentManagement;
                         