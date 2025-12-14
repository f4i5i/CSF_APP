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
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

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

  // Determine data to display for current page (client-side pagination fallback)
  const displayedData = React.useMemo(() => {
    if (!pagination) return sortedData || [];
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return (sortedData || []).slice(start, end);
  }, [sortedData, pagination, currentPage, itemsPerPage]);

  // Pagination calculations
  const totalPages = itemsPerPage ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Render cell content based on column type
  const renderCell = (row, column) => {
    const value = row[column.key];

    // Custom render function
    if (column.render) {
      return column.render(value, row);
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
          <div className="flex items-center justify-start gap-2">
            {actions.map((action, i) => {
              const Icon = action.icon;
              const onClick = (e) => {
                e.stopPropagation();
                action.onClick && action.onClick();
              };

              const baseClass =
                "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition";
              const variantClass = action.variant === "destructive"
                ? "bg-error-dark text-white hover:bg-red-700"
                : "bg-btn-gold text-text-body hover:bg-btn-gold/90";

              return (
                <button
                  key={i}
                  onClick={onClick}
                  className={`${baseClass} ${variantClass}`}
                  type="button"
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  <span className="whitespace-nowrap">{action.label}</span>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-border-light">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-manrope font-semibold text-heading-dark uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-border-light">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-manrope font-semibold text-heading-dark uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="py-12 text-center">
          <p className="text-text-muted font-manrope">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table */}
      <div
        className="overflow-x-auto pb-24 custom-scrollbar"
        style={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}
      >
        <table className="w-full">
          <thead className="bg-white border-b border-border-light">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className={`px-6 py-3 text-left text-sm font-manrope font-semibold text-heading-dark uppercase tracking-wider ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 select-none"
                      : ""
                  } ${column.align === "right" ? "text-right" : ""} ${
                    column.align === "center" ? "text-center" : ""
                  }`}
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
            {displayedData?.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={` hover:bg-gray-50 transition-colors duration-300 ease-in-out
                  ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                  transition
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap font-manrope text-sm text-text-primary ${
                      column.align === "right" ? "text-right" : ""
                    } ${column.align === "center" ? "text-center" : ""}`}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="sm:absolute relative left-0 right-0 bottom-0 sm:z-10">
          <div className="">
            <div className="sm:px-6 px-2 py-4 border-t border-border-light flex items-center justify-between bg-white shadow-sm rounded-t-lg">
              {/* Results info */}
              <div className="text-sm text-text-muted font-semibold font-manrope">
                Showing <span className="font-bold text-text-primary">{startItem}</span> to{" "}
                <span className="font-bold text-text-primary">{endItem}</span> of{" "}
                <span className="font-bold text-text-primary">{totalItems}</span> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Prev Button */}
                <button
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg transition
              text-text-muted hover:bg-btn-gold/10
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 font-manrope">
                  {[...Array(totalPages)].map((_, index) => {
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
                          className={`
                  px-3 py-1.5 rounded-lg text-sm font-semibold transition
                  ${
                    page === currentPage
                      ? "bg-btn-gold text-neutral-white shadow-sm"
                      : "text-text-muted hover:bg-btn-gold/10 hover:text-heading-dark"
                  }
                `}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-text-muted">
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
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg transition
              text-text-muted hover:bg-btn-gold/10
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
