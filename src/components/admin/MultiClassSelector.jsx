/**
 * Multi-Class Selector Component
 * Reusable component for selecting multiple classes with checkboxes
 */

import React, { useState, useMemo } from "react";
import { Check, Search, X } from "lucide-react";

export default function MultiClassSelector({
  classes = [],
  selectedIds = [],
  onChange,
  disabled = false,
  label = "Target Classes",
  placeholder = "Search classes...",
  maxHeight = "200px",
  showSelectAll = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter classes based on search
  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return classes;
    const term = searchTerm.toLowerCase();
    return classes.filter(
      (cls) =>
        cls.name?.toLowerCase().includes(term) ||
        cls.description?.toLowerCase().includes(term)
    );
  }, [classes, searchTerm]);

  const handleToggle = (classId) => {
    if (disabled) return;
    const newSelection = selectedIds.includes(classId)
      ? selectedIds.filter((id) => id !== classId)
      : [...selectedIds, classId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = filteredClasses.map((cls) => cls.id);
    // If all filtered are already selected, deselect them
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // Remove filtered classes from selection
      onChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      // Add all filtered classes to selection
      const newSelection = [...new Set([...selectedIds, ...allIds])];
      onChange(newSelection);
    }
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const allFilteredSelected =
    filteredClasses.length > 0 &&
    filteredClasses.every((cls) => selectedIds.includes(cls.id));

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
        {showSelectAll && classes.length > 0 && (
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
      {classes.length > 5 && (
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

      {/* Class list */}
      <div
        className="border border-gray-200 rounded-lg overflow-hidden"
        style={{ maxHeight }}
      >
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {filteredClasses.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm font-manrope">
              {classes.length === 0
                ? "No classes available"
                : "No classes match your search"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredClasses.map((cls) => {
                const isSelected = selectedIds.includes(cls.id);
                return (
                  <label
                    key={cls.id}
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
                      onChange={() => handleToggle(cls.id)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate font-manrope">
                        {cls.name}
                      </span>
                      {cls.program_name && (
                        <span className="block text-xs text-gray-500 truncate font-manrope">
                          {cls.program_name}
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

      {/* Selected chips (optional, show when many selected) */}
      {selectedIds.length > 0 && selectedIds.length <= 5 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedIds.map((id) => {
            const cls = classes.find((c) => c.id === id);
            if (!cls) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-btn-gold/20 text-btn-gold text-xs rounded-full font-manrope"
              >
                {cls.name}
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
    </div>
  );
}
