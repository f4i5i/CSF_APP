import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * ClassFilterDropdown - Pill-shaped class selector dropdown
 * Matches Figma design: White/30% bg, #E1E1E1 border, rounded-[42px]
 */
const ClassFilterDropdown = ({
  classes = [],
  selectedClass,
  onSelectClass,
  placeholder = "Select a class"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format class display text: "School • Grade • Day"
  const getClassDisplayText = (classItem) => {
    if (!classItem) return placeholder;
    const parts = [];
    if (classItem.school?.name) parts.push(classItem.school.name);
    if (classItem.grade) parts.push(`Grade ${classItem.grade}`);
    if (classItem.day) parts.push(classItem.day);
    return parts.join(' • ') || classItem.name || placeholder;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[2px] px-[12px] py-[8px] bg-white/30 border border-[#E1E1E1] rounded-[42px] cursor-pointer transition-all hover:bg-white/50"
      >
        <span className="font-manrope font-medium text-[16px] leading-[1.5] text-[#1B1B1B]">
          {getClassDisplayText(selectedClass)}
        </span>
        <ChevronDown
          size={20}
          className={`text-[#1B1B1B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && classes.length > 0 && (
        <div className="absolute top-full left-0 mt-2 min-w-full bg-card_bg rounded-[16px] shadow-lg border border-gray-100 z-50  max-h-[300px] overflow-y-auto">
          {classes.map((classItem) => (
            <button
              key={classItem.id}
              onClick={() => {
                onSelectClass(classItem);
                setIsOpen(false);
              }}
              className={`w-full border-b border-border-light text-left px-4 py-3 font-manrope text-[14px] hover:bg-gray-50 transition-colors ${
                selectedClass?.id === classItem.id ? 'text-white font-semibold bg-[#173151]' : 'text-[#1B1B1B]'
              }`}
            >
              {getClassDisplayText(classItem)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassFilterDropdown;
