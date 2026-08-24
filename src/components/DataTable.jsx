import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DataTable = ({ columns, data, searchPlaceholder = "Search...", isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Generic Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      // Check if any value in the object matches the search term
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowercasedSearch)
      );
    });
  }, [data, searchTerm]);

  // Reset to first page if rowsPerPage changes or search happens
  useMemo(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">

      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-[14px] font-medium bg-white border border-slate-200/80 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-500">Show:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="text-[14px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-500">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center text-blue-600 gap-3">
                    <Loader2 size={32} className="animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-slate-400 font-medium">
                  No data found matching your criteria.
                </td>
              </tr>
            ) : currentData.map((row, rowIndex) => {
              const globalIndex = (currentPage - 1) * rowsPerPage + rowIndex + 1;

              return (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                  {columns.map((col, colIndex) => {
                    const alignClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '';

                    let cellContent;
                    if (col.render) {
                      cellContent = col.render(row, globalIndex);
                    } else if (col.key === 'sno') {
                      cellContent = <span className="font-medium text-slate-400">{globalIndex}</span>;
                    } else {
                      cellContent = row[col.key];
                    }

                    return (
                      <td key={colIndex} className={`px-6 py-4 ${alignClass}`}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-white">
        <p className="text-[13px] font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-bold text-slate-800">{filteredData.length}</span> entries
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default DataTable;
