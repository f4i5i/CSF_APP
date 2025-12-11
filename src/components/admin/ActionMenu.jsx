/**
 * ActionMenu Component
 * Dropdown menu for table row actions (edit, delete, view, etc.)
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        title="Actions"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isDestructive = action.variant === 'destructive';
            const isDisabled = action.disabled;

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleActionClick(action)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-manrope
                  ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : isDestructive
                    ? 'text-red-700 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                  transition
                `}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 ${
                      isDisabled
                        ? 'text-gray-400'
                        : isDestructive
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  />
                )}
                <span>{action.label}</span>
              </button>
            );
          })}

          {actions.length === 0 && (
            <div className="px-4 py-2.5 text-sm text-gray-500 font-manrope">
              No actions available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
