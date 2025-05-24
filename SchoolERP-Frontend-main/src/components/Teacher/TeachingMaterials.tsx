import React, { useState } from "react";
import { Book, File, FilePlus, FolderPlus, Search, Grid, List, Download, Share2, MoreHorizontal } from "lucide-react";

// Mock data for teaching materials
const MOCK_MATERIALS = [
  {
    id: 1,
    name: "Algebra Fundamentals",
    type: "pdf",
    size: "2.4 MB",
    lastModified: "2025-02-15",
    subject: "Mathematics",
    grade: "9",
    tags: ["Algebra", "Fundamentals"]
  },
  {
    id: 2,
    name: "Chemistry Lab Safety Guidelines",
    type: "docx",
    size: "1.8 MB",
    lastModified: "2025-02-20",
    subject: "Science",
    grade: "10",
    tags: ["Lab Safety", "Chemistry"]
  },
  {
    id: 3,
    name: "Shakespeare Introduction Presentation",
    type: "pptx",
    size: "5.7 MB",
    lastModified: "2025-02-10",
    subject: "English Literature",
    grade: "11",
    tags: ["Shakespeare", "Literature"]
  },
  {
    id: 4,
    name: "Linear Equations Worksheet",
    type: "pdf",
    size: "1.2 MB",
    lastModified: "2025-03-01",
    subject: "Mathematics",
    grade: "8",
    tags: ["Linear Equations", "Worksheet"]
  },
  {
    id: 5,
    name: "Cell Structure Diagram",
    type: "png",
    size: "3.5 MB",
    lastModified: "2025-02-25",
    subject: "Science",
    grade: "10",
    tags: ["Cell Biology", "Diagram"]
  },
  {
    id: 6,
    name: "Grammar Rules Cheat Sheet",
    type: "pdf",
    size: "0.9 MB",
    lastModified: "2025-03-05",
    subject: "English",
    grade: "8",
    tags: ["Grammar", "Reference"]
  }
];

// File type icons
const getFileIcon = (type: string) => {
  switch(type) {
    case 'pdf': return <File className="h-6 w-6 text-red-500" />;
    case 'docx': return <File className="h-6 w-6 text-blue-500" />;
    case 'pptx': return <File className="h-6 w-6 text-orange-500" />;
    case 'xlsx': return <File className="h-6 w-6 text-green-500" />;
    case 'png':
    case 'jpg': 
    case 'jpeg': return <File className="h-6 w-6 text-purple-500" />;
    default: return <File className="h-6 w-6 text-gray-500" />;
  }
};

const TeachingMaterials: React.FC = () => {
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  
  // Get unique subjects and grades for filters
  const subjects = Array.from(new Set(materials.map(m => m.subject)));
  const grades = Array.from(new Set(materials.map(m => m.grade)));
  
  // Filter materials
  const filteredMaterials = materials.filter(material => {
    // Search term filter
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Subject filter
    const matchesSubject = !selectedSubject || material.subject === selectedSubject;
    
    // Grade filter
    const matchesGrade = !selectedGrade || material.grade === selectedGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Teaching Materials</h1>
          
          <div className="flex space-x-3">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors">
              <FilePlus className="h-5 w-5 mr-2" />
              Upload File
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
              <FolderPlus className="h-5 w-5 mr-2" />
              New Folder
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select 
              value={selectedSubject || ""}
              onChange={(e) => setSelectedSubject(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select 
              value={selectedGrade || ""}
              onChange={(e) => setSelectedGrade(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
              >
                <Grid className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
              >
                <List className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Materials display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map(material => (
              <div key={material.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(material.type)}
                    <span className="ml-2 text-xs text-gray-500 uppercase">{material.type}</span>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <h3 className="font-medium text-gray-800 mb-2">{material.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {material.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <div>Subject: {material.subject}</div>
                  <div>Grade: {material.grade}</div>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Size: {material.size}</div>
                  <div>Modified: {new Date(material.lastModified).toLocaleDateString()}</div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </button>
                  <button className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map(material => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(material.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{material.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-5 w-5" />
                        </button>
                        <button className="text-emerald-600 hover:text-emerald-800">
                          <Share2 className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Empty state if no materials match filters */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No materials found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingMaterials;