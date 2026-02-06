/**
 * DataTable Component
 * Reusable data table with sorting, pagination, and actions
 */

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  pagination = true,
  itemsPerPage = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  expandable = false,
  renderExpanded,
  onExpand,
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = async (rowId, row) => {
    const isExpanding = !expandedRows[rowId];

    // If expanding and onExpand callback provided, call it to load data
    if (isExpanding && onExpand) {
      await onExpand(row);
    }

    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const handleSort = (column) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Determine data to display for current page
  // If server-side pagination is used (data.length <= itemsPerPage), don't slice again
  const displayedData = React.useMemo(() => {
    if (!pagination) return sortedData || [];
    // Server-side pagination: data is already paginated
    if (totalItems > 0 && data.length <= itemsPerPage) {
      return sortedData || [];
    }
    // Client-side pagination fallback
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return (sortedData || []).slice(start, end);
  }, [sortedData, pagination, currentPage, itemsPerPage, totalItems, data.length]);

  // Pagination calculations
  const totalPages = itemsPerPage ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Render cell content based on column type
  const renderCell = (row, column, rowId) => {
    const value = row[column.key];
    const isExpanded = expandedRows[rowId];

    // Custom render function - pass expand controls as third parameter
    if (column.render) {
      return column.render(value, row, {
        isExpanded,
        toggleExpand: () => toggleExpand(rowId, row),
        expandable,
      });
    }

    // Status badge
    if (column.type === "status") {
      return <StatusBadge status={value} />;
    }

    // Currency
    if (column.type === "currency") {
      return (
        <span className="font-semibold">
          ${parseFloat(value || 0).toFixed(2)}
        </span>
      );
    }

    // Date
    if (column.type === "date") {
      if (!value) return "-";
      const formatted = new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return (
        <span className="text-sm font-manrope text-text-muted">
          {formatted}
        </span>
      );
    }

    // Actions menu
      if (column.type === "actions" && column.actions) {
        const actions =
          typeof column.actions === "function"
            ? column.actions(row)
            : column.actions;

        return (
          <div className="flex items-center justify-end gap-1 flex-wrap min-w-[100px]">
            {actions.map((action, i) => {
              const Icon = action.icon;
              const onClick = (e) => {
                e.stopPropagation();
                action.onClick && action.onClick();
              };

              const baseClass =
                "inline-flex items-center justify-center p-1.5 lg:px-2.5 lg:py-1.5 rounded-md text-xs font-medium transition";
              const variantClass = action.variant === "destructive"
                ? "bg-error-dark text-white hover:bg-red-700"
                : "bg-btn-gold text-text-body hover:bg-btn-gold/90";

              return (
                <button
                  key={i}
                  onClick={onClick}
                  className={`${baseClass} ${variantClass}`}
                  type="button"
                  title={action.label}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 lg:mr-1" />}
                  <span className="hidden lg:inline whitespace-nowrap">{action.label}</span>
                </button>
              );
            })}
          </div>
        );
      }

    // Default: text
    return value || "-";
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-border-light">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-manrope font-semibold text-heading-dark uppercase tracking-wider ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-3 sm:px-6 py-3 sm:py-4 ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    }`}>
                      <div className="h-4 bg-border-light rounded w-3/4"></div>
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

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-border-light">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-manrope font-semibold text-heading-dark uppercase tracking-wider ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="py-8 sm:py-12 text-center">
          <p className="text-text-muted font-manrope text-sm sm:text-base">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Table */}
      <div className="overflow-auto custom-scrollbar flex-1 min-h-0">
        <table className="w-full min-w-[800px]">
          <thead className="bg-white border-b border-border-light sticky top-0 z-10">
            <tr>
              {/* Empty header for expand column */}
              {expandable && <th className="w-10 bg-white"></th>}
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-manrope font-semibold text-heading-dark uppercase tracking-wider bg-white ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 select-none"
                      : ""
                  } ${column.align === "right" ? "text-right" : ""} ${
                    column.align === "center" ? "text-center" : ""
                  } ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span>
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-white ">
            {displayedData?.map((row, rowIndex) => {
              const rowId = row.id || rowIndex;
              const isExpanded = expandedRows[rowId];

              return (
                <React.Fragment key={rowId}>
                  <tr
                    onClick={() => onRowClick && onRowClick(row)}
                    className={` hover:bg-gray-50 transition-colors duration-300 ease-in-out
                      ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                      ${isExpanded ? "bg-gray-50" : ""}
                      transition
                    `}
                  >
                    {/* Expand button column */}
                    {expandable && (
                      <td className="px-3 py-4 w-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(rowId, row);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          type="button"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-3 sm:px-6 py-3 sm:py-4 font-manrope text-xs sm:text-sm text-text-primary ${
                          column.align === "right" ? "text-right" : ""
                        } ${column.align === "center" ? "text-center" : ""} ${
                          column.hideOnMobile ? "hidden md:table-cell" : ""
                        }`}
                      >
                        {renderCell(row, column, rowId)}
                      </td>
                    ))}
                  </tr>
                  {/* Expanded content row */}
                  {expandable && isExpanded && renderExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={columns.length + 1} className="px-6 py-4">
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="shrink-0 sm:px-6 px-3 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          {/* Results info */}
          <div className="text-xs sm:text-sm text-text-muted font-semibold font-manrope text-center sm:text-left">
            Showing <span className="font-bold text-text-primary">{startItem}</span> to{" "}
            <span className="font-bold text-text-primary">{endItem}</span> of{" "}
            <span className="font-bold text-text-primary">{totalItems}</span> results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Prev Button */}
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg transition text-text-muted hover:bg-btn-gold/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-0.5 sm:gap-1 font-manrope">
              {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
                const page = index + 1;

                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange && onPageChange(page)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                        page === currentPage
                          ? "bg-btn-gold text-neutral-white shadow-sm"
                          : "text-text-muted hover:bg-btn-gold/10 hover:text-heading-dark"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-1 sm:px-2 text-text-muted text-xs sm:text-sm">
                      •••
                    </span>
                  );
                }

                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 sm:p-2 rounded-lg transition text-text-muted hover:bg-btn-gold/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
