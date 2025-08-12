import React from 'react';

interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick, 
  loading = false,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/50 dark:bg-gray-900/20 divide-y divide-gray-200 dark:divide-gray-700/50">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                onClick={() => onRowClick?.(item)}
                className={`${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50' 
                    : ''
                } transition-colors duration-200`}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
export { Table };