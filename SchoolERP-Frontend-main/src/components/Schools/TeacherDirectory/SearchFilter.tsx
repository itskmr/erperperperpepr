import React from 'react';
import { Search, User2 } from 'lucide-react';
import { AVAILABLE_CLASSES } from './data';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  classFilter: string;
  setClassFilter: (filter: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  classFilter,
  setClassFilter
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
      <div className="relative w-full lg:w-64">
        <input
          type="text"
          placeholder="Search teachers..."
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto"> 
        <div className="flex items-center space-x-2">
          <User2 className="h-4 w-4 text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {AVAILABLE_CLASSES.map((classNum) => (
              <option key={classNum} value={classNum}>
                Class {classNum}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;