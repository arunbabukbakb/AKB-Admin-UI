import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronUp, ChevronDown, ChevronsUpDown, RotateCw, Loader
} from 'lucide-react';
import apiService from '../../services/api';
import '../../pages/Pages.css';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ServerTable = ({
  apiUrl,
  columns = [],
  searchPlaceholder = 'Search records...',
  additionalParams = {},
  idField = 'id',
  rowActions,
  mockDataGenerator, // Optional fallback function to generate test data if offline
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search & Sort states
  const [searchString, setSearchString] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const debouncedSearch = useDebounce(searchString, 450);

  // Stable refs for unstable parent props to prevent infinite API re-fetch loops
  const mockDataGeneratorRef = React.useRef(mockDataGenerator);
  useEffect(() => {
    mockDataGeneratorRef.current = mockDataGenerator;
  }, [mockDataGenerator]);

  const additionalParamsStr = JSON.stringify(additionalParams);

  // Fetch Data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = {
      pageNumber,
      pageSize,
      search: debouncedSearch || '',
      sortBy: sortColumn || '',
      sortOrder: sortOrder || 'asc',
      ...JSON.parse(additionalParamsStr)
    };

    try {
      const response = await apiService.get(apiUrl, { params: queryParams });

      if (response && response.status === false) {
        throw new Error(response.message || 'Failed to retrieve records.');
      }

      const responseData = response?.data || [];
      const pagination = response?.pagination || {};

      setData(Array.isArray(responseData) ? responseData : []);
      setTotalRecords(pagination.totalRecords || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch (err) {
      console.warn(`ServerSideTable API fetch from /${apiUrl} failed:`, err.message);

      // Offline/Mock fallback generator
      if (mockDataGeneratorRef.current) {
        // Simulate database query inside frontend
        const allMock = mockDataGeneratorRef.current();

        // 1. Search filter
        let filtered = allMock;
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          filtered = allMock.filter(row =>
            Object.values(row).some(val =>
              val !== null && val !== undefined && val.toString().toLowerCase().includes(searchLower)
            )
          );
        }

        // 2. Sort filter
        if (sortColumn) {
          filtered.sort((a, b) => {
            let valA = a[sortColumn] ?? '';
            let valB = b[sortColumn] ?? '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }

        // 3. Paginate
        const total = filtered.length;
        const pages = Math.ceil(total / pageSize);
        const startIndex = (pageNumber - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        setData(pageItems);
        setTotalRecords(total);
        setTotalPages(pages || 1);
        setError('Displaying offline simulated data (API offline).');
      } else {
        setError(err.message || 'Failed to retrieve records from the server.');
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, pageNumber, pageSize, debouncedSearch, sortColumn, sortOrder, additionalParamsStr]);

  // Reset to page 1 when search or sorting changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, sortColumn, sortOrder]);

  // Reload trigger
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle header sorting click
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      // Toggle order
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (col) => {
    if (!col.sortable) return null;
    if (sortColumn !== col.key) {
      return <ChevronsUpDown size={13} style={{ marginLeft: '4px', opacity: 0.5 }} />;
    }
    return sortOrder === 'asc'
      ? <ChevronUp size={13} style={{ marginLeft: '4px', color: 'var(--primary)' }} />
      : <ChevronDown size={13} style={{ marginLeft: '4px', color: 'var(--primary)' }} />;
  };

  // Safe pagination page calculations
  const rangeStart = (pageNumber - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNumber * pageSize, totalRecords);

  // Generate page numbers array to show in middle buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pageNumber - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)', position: 'relative' }}>

      {/* Top Search and page size toolbar */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '0' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
          <input
            type="text"
            className="form-control"
            placeholder={searchPlaceholder}
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            style={{
              padding: '0.35rem 0.5rem 0.35rem 2rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: '100%',
              outline: 'none',
              height: '32px'
            }}
          />
        </div>

        {/* Action button bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <button
            onClick={fetchData}
            className="nav-action-btn"
            title="Refresh Data"
            disabled={loading}
            style={{ border: '1px solid var(--border-color)', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RotateCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
            style={{
              height: '32px',
              padding: '0.15rem 1.5rem 0.15rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: '500',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'none\' stroke=\'%236c757d\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.4rem center',
              backgroundSize: '8px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Warning/Offline Alert */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          backgroundColor: error.includes('simulated') ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${error.includes('simulated') ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}`,
          color: error.includes('simulated') ? '#f59e0b' : 'var(--danger)',
          fontSize: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <span>{error}</span>
        </div>
      )}

      {/* Responsive Table / Card Wrapper */}
      <div style={{ position: 'relative' }}>

        {/* Loading Spinner overlay */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.12)',
            backdropFilter: 'blur(2px)',
            webkitBackdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Loader className="spin" size={20} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Updating...</span>
            </div>
          </div>
        )}

        {/* Desktop View Table */}
        <div className="desktop-table-view" style={{ borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{
                        padding: '0.2rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        cursor: col.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{col.label}</span>
                        {getSortIcon(col)}
                      </div>
                    </th>
                  ))}
                  {rowActions && (
                    <th style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      width: '80px',
                      textAlign: 'right'
                    }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <tr
                      key={row[idField] || rowIndex}
                      style={{
                        borderBottom: rowIndex === data.length - 1 ? 'none' : '1px solid var(--border-color)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.012)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            verticalAlign: 'middle',
                            whiteSpace: col.wrap ? 'normal' : 'nowrap'
                          }}
                        >
                          {col.render ? col.render(row[col.key], row, rowIndex) : (row[col.key]?.toString() ?? '')}
                        </td>
                      ))}
                      {rowActions && (
                        <td style={{
                          padding: '0.3rem 0.75rem',
                          textAlign: 'right',
                          verticalAlign: 'middle'
                        }}>
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (rowActions ? 1 : 0)}
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                      }}
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View Cards (App-like format) */}
        <div className="mobile-cards-view">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <div key={row[idField] || rowIndex} className="mobile-row-card">
                <div className="card-header-row">
                  <span className="card-primary-title">
                    {/* Render the second column (typically Title/Name) or ID as main text */}
                    {columns[1]?.render ? columns[1].render(row[columns[1].key], row, rowIndex) : (row[columns[1]?.key] ?? `#${row[idField]}`)}
                  </span>
                  {rowActions && (
                    <div className="card-actions-wrapper">
                      {rowActions(row)}
                    </div>
                  )}
                </div>

                <div className="card-body-fields">
                  {columns.map((col) => (
                    <div key={col.key} className="card-field-item">
                      <span className="card-field-label">{col.label}</span>
                      <span className="card-field-value">
                        {col.render ? col.render(row[col.key], row, rowIndex) : (row[col.key]?.toString() ?? '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
              No records found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {totalRecords > 0 && (
        <div className="pwa-footer" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>

          {/* Records Summary */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{rangeStart}</strong> to <strong style={{ color: 'var(--text-main)' }}>{rangeEnd}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalRecords}</strong> entries
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

            {/* First page */}
            <button
              onClick={() => setPageNumber(1)}
              disabled={pageNumber === 1 || loading}
              className="pwa-page-btn"
              title="First Page"
            >
              <ChevronsLeft size={12} />
            </button>

            {/* Prev page */}
            <button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber === 1 || loading}
              className="pwa-page-btn"
              title="Previous Page"
            >
              <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} />
            </button>

            {/* Page number buttons */}
            {getPageNumbers().map(num => (
              <button
                key={num}
                onClick={() => setPageNumber(num)}
                disabled={loading}
                className={`pwa-page-btn ${pageNumber === num ? 'active' : ''}`}
              >
                {num}
              </button>
            ))}

            {/* Next page */}
            <button
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
              disabled={pageNumber === totalPages || loading}
              className="pwa-page-btn"
              title="Next Page"
            >
              <ChevronRight size={12} />
            </button>

            {/* Last page */}
            <button
              onClick={() => setPageNumber(totalPages)}
              disabled={pageNumber === totalPages || loading}
              className="pwa-page-btn"
              title="Last Page"
            >
              <ChevronsRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Styled custom classes inline block */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        .pwa-page-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-page-btn:hover:not(:disabled) {
          background-color: var(--bg-card-hover);
          color: var(--text-main);
          border-color: var(--text-muted);
        }

        .pwa-page-btn.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .pwa-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Mobile app-style card grid layout rules */
        .mobile-cards-view {
          display: none;
          flex-direction: column;
          gap: 10px;
        }

        .mobile-row-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          margin-bottom: 2px;
        }

        .card-primary-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .card-body-fields {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-field-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
        }

        .card-field-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .card-field-value {
          color: var(--text-main);
          font-weight: 600;
          text-align: right;
        }

        @media (max-width: 768px) {
          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-view {
            display: flex !important;
          }
          .pwa-footer {
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ServerTable;
