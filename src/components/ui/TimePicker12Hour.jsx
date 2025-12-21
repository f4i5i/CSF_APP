import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

/**
 * 12-Hour Time Picker Component
 * Displays and allows selection of time in 12-hour format (e.g., "9:00 AM")
 * but stores value in 24-hour format (e.g., "09:00") for HTML5 compatibility
 */

// Generate hour options (1-12)
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const hour = i === 0 ? 12 : i;
  return { value: hour, label: hour.toString() };
});

// Generate minute options (00, 15, 30, 45) - can be expanded to full 00-59
const MINUTES = [
  { value: 0, label: "00" },
  { value: 15, label: "15" },
  { value: 30, label: "30" },
  { value: 45, label: "45" },
];

const PERIODS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

/**
 * Convert 24-hour format (HH:mm) to 12-hour components
 */
const parse24Hour = (time24) => {
  if (!time24) return { hour: 9, minute: 0, period: "AM" };

  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return { hour: 9, minute: 0, period: "AM" };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);

  const period = hour >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  if (hour === 0) {
    hour = 12; // 00:00 = 12 AM
  } else if (hour > 12) {
    hour -= 12; // 13:00 = 1 PM, etc.
  }

  return { hour, minute, period };
};

/**
 * Convert 12-hour components to 24-hour format (HH:mm)
 */
const to24Hour = (hour, minute, period) => {
  let hour24 = hour;

  if (period === "AM") {
    if (hour === 12) {
      hour24 = 0; // 12 AM = 00:00
    }
  } else {
    // PM
    if (hour !== 12) {
      hour24 = hour + 12; // 1 PM = 13:00, etc.
    }
  }

  return `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

/**
 * Format for display: "9:00 AM"
 */
const formatDisplay = (hour, minute, period) => {
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

export default function TimePicker12Hour({ value, onChange, placeholder = "Select time", error }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse the 24-hour value into components
  const { hour, minute, period } = parse24Hour(value);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Update internal state when value changes
  useEffect(() => {
    const parsed = parse24Hour(value);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection changes
  const handleChange = (newHour, newMinute, newPeriod) => {
    const h = newHour ?? selectedHour;
    const m = newMinute ?? selectedMinute;
    const p = newPeriod ?? selectedPeriod;

    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);

    // Convert to 24-hour format and call onChange
    const time24 = to24Hour(h, m, p);
    onChange(time24);
  };

  const displayValue = value
    ? formatDisplay(selectedHour, selectedMinute, selectedPeriod)
    : placeholder;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${
          error ? "border-btn-gold" : "border-border-light"
        }`}
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span
          className={`text-xs sm:text-base ${
            value ? "text-gray-900 font-manrope" : "text-gray-400 font-manrope"
          }`}
        >
          {displayValue}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -10,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20"
      >
        <div className="p-3">
          <div className="flex gap-2">
            {/* Hour Select */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Hour
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                {HOURS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => handleChange(h.value, null, null)}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-btn-gold hover:text-heading-dark transition-colors ${
                      selectedHour === h.value
                        ? "bg-btn-gold text-heading-dark font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Select */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Min
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                {MINUTES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleChange(null, m.value, null)}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-btn-gold hover:text-heading-dark transition-colors ${
                      selectedMinute === m.value
                        ? "bg-btn-gold text-heading-dark font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Select */}
            <div className="w-16">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                &nbsp;
              </label>
              <div className="border border-gray-200 rounded-md">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleChange(null, null, p.value)}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-btn-gold hover:text-heading-dark transition-colors ${
                      selectedPeriod === p.value
                        ? "bg-btn-gold text-heading-dark font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 px-4 py-2 bg-btn-gold text-heading-dark font-semibold rounded-lg hover:bg-[#e5ad35] transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
