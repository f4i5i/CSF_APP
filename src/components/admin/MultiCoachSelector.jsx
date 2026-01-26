/**
 * Multi-Coach Selector Component
 * Reusable component for selecting multiple coaches with checkboxes
 */

import React, { useState, useMemo } from "react";
import { Check, Search, X, User } from "lucide-react";

export default function MultiCoachSelector({
  coaches = [],
  selectedIds = [],
  onChange,
  disabled = false,
  label = "Assign Coaches",
  placeholder = "Search coaches...",
  maxHeight = "200px",
  showSelectAll = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter coaches based on search
  const filteredCoaches = useMemo(() => {
    if (!searchTerm.trim()) return coaches;
    const term = searchTerm.toLowerCase();
    return coaches.filter(
      (coach) =>
        coach.full_name?.toLowerCase().includes(term) ||
        coach.email?.toLowerCase().includes(term)
    );
  }, [coaches, searchTerm]);

  const handleToggle = (coachId) => {
    if (disabled) return;
    const newSelection = selectedIds.includes(coachId)
      ? selectedIds.filter((id) => id !== coachId)
      : [...selectedIds, coachId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = filteredCoaches.map((coach) => coach.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedIds, ...allIds])];
      onChange(newSelection);
    }
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const allFilteredSelected =
    filteredCoaches.length > 0 &&
    filteredCoaches.every((coach) => selectedIds.includes(coach.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 font-manrope">
          {label}
          {selectedIds.length > 0 && (
            <span className="ml-2 text-xs text-btn-gold font-semibold">
              ({selectedIds.length} selected)
            </span>
          )}
        </label>
        {showSelectAll && coaches.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled}
              className="text-xs text-btn-gold hover:text-btn-gold/80 font-medium disabled:opacity-50 font-manrope"
            >
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </button>
            {selectedIds.length > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  disabled={disabled}
                  className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50 font-manrope"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search input */}
      {coaches.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold disabled:opacity-50 font-manrope"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Coach list */}
      <div
        className="border border-gray-200 rounded-lg overflow-hidden"
        style={{ maxHeight }}
      >
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {filteredCoaches.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm font-manrope">
              {coaches.length === 0
                ? "No coaches available"
                : "No coaches match your search"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCoaches.map((coach) => {
                const isSelected = selectedIds.includes(coach.id);
                return (
                  <label
                    key={coach.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-btn-gold/10 hover:bg-btn-gold/15"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-btn-gold border-btn-gold"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(coach.id)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate font-manrope">
                        {coach.full_name}
                      </span>
                      {coach.assigned_classes !== undefined && (
                        <span className="block text-xs text-gray-500 truncate font-manrope">
                          {coach.assigned_classes} class{coach.assigned_classes !== 1 ? 'es' : ''} assigned
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected chips */}
      {selectedIds.length > 0 && selectedIds.length <= 5 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedIds.map((id) => {
            const coach = coaches.find((c) => c.id === id);
            if (!coach) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-btn-gold/20 text-btn-gold text-xs rounded-full font-manrope"
              >
                {coach.full_name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleToggle(id)}
                    className="hover:text-btn-gold/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Selected coaches can access this class in their portal
      </p>
    </div>
  );
}
