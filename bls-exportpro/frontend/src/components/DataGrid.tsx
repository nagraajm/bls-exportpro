import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  Filter,
  Download,
  X
} from 'lucide-react';
import { Button } from './Button';

interface DataGridProps {
  data: any[];
  title?: string;
  showSearch?: boolean;
  showExport?: boolean;
  pageSize?: number;
}

export const DataGrid: React.FC<DataGridProps> = ({ 
  data, 
  title, 
  showSearch = true,
  showExport = true,
  pageSize = 25 
}) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Clean and process the data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Skip header rows and clean data
    return data.map((row, index) => {
      const cleanedRow: any = { _rowId: index };
      
      Object.keys(row).forEach(key => {
        // Skip empty column names and metadata
        if (!key.startsWith('__EMPTY') && key !== 'rowNumber' && key !== 'sheetName') {
          const value = row[key];
          // Use better column names
          const cleanKey = key.replace(/_/g, ' ').trim();
          cleanedRow[cleanKey] = value;
        }
      });
      
      return cleanedRow;
    });
  }, [data]);

  // Get column names (excluding metadata)
  const columns = useMemo(() => {
    if (processedData.length === 0) return [];
    
    const firstRow = processedData[0];
    return Object.keys(firstRow).filter(key => 
      key !== '_rowId' && 
      firstRow[key] !== undefined && 
      firstRow[key] !== null
    );
  }, [processedData]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...processedData];
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply column filter
    if (filterColumn && filterValue) {
      filtered = filtered.filter(row => 
        String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        
        if (sortDirection === 'asc') {
          return String(aVal).localeCompare(String(bVal));
        } else {
          return String(bVal).localeCompare(String(aVal));
        }
      });
    }
    
    return filtered;
  }, [processedData, searchTerm, filterColumn, filterValue, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      columns.join(','),
      ...filteredData.map(row => 
        columns.map(col => `"${row[col] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Format cell value for display
  const formatCellValue = (value: any, column: string): string => {
    if (value === null || value === undefined || value === '') return '-';
    
    // Format dates
    if (column.toLowerCase().includes('date') || column.toLowerCase().includes('expiry')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch {}
    }
    
    // Format numbers
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const s = String(status).toLowerCase();
    if (s.includes('active') || s.includes('registered') || s.includes('approved')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (s.includes('pending') || s.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    if (s.includes('expired') || s.includes('rejected') || s.includes('abd')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        
        <div className="flex flex-wrap gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 
                         focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <select
            value={filterColumn}
            onChange={(e) => setFilterColumn(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Select column...</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          
          {filterColumn && (
            <>
              <input
                type="text"
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-sm flex-1"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterColumn('');
                  setFilterValue('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
        {searchTerm && ` (filtered from ${processedData.length} total)`}
      </div>

      {/* Data table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map(column => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 
                           uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                           select-none group"
                >
                  <div className="flex items-center justify-between">
                    <span>{column}</span>
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortField === column ? (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, rowIndex) => (
              <tr key={row._rowId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {columns.map(column => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {column.toLowerCase().includes('status') ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[column])}`}>
                        {formatCellValue(row[column], column)}
                      </span>
                    ) : (
                      formatCellValue(row[column], column)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }).filter(Boolean)}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};