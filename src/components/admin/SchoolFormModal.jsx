/**
 * SchoolFormModal Component
 * Modal for creating and editing schools (Admin only)
 */

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import schoolsService from "../../api/services/schools.service";
import toast from "react-hot-toast";

function CustomDropdown({ value, onChange, options, placeholder, error, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${
          error ? "border-red-500" : "border-border-light"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`text-sm truncate ${selectedOption ? "text-gray-900" : "text-gray-400"}`}>
          {displayText}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
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
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
      >
        {options.length > 5 && (
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-btn-gold"
              />
            </div>
          </div>
        )}
        <div className="max-h-48 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`w-full px-4 py-2 text-left hover:bg-btn-gold hover:text-heading-dark transition-colors text-sm ${
                  value === option.id ? "bg-btn-gold text-text-primary" : "text-heading-dark"
                }`}
              >
                {option.name}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function SchoolFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
  areas = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    area_id: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          address: initialData.address || "",
          city: initialData.city || "",
          state: initialData.state || "",
          zip_code: initialData.zip_code || "",
          area_id: initialData.area_id || "",
          is_active: initialData.is_active ?? true,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          address: "",
          city: "",
          state: "",
          zip_code: "",
          area_id: "",
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, initialData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "School name is required";
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state?.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zip_code?.trim()) {
      newErrors.zip_code = "ZIP code is required";
    }
    if (!formData.area_id) {
      newErrors.area_id = "Area is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        code: formData.code?.trim() || null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zip_code.trim(),
        area_id: formData.area_id,
        is_active: formData.is_active,
      };

      if (mode === "create") {
        await schoolsService.create(submitData);
        toast.success("School created successfully");
      } else {
        await schoolsService.update(initialData.id, submitData);
        toast.success("School updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save school:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        `Failed to ${mode === "create" ? "create" : "update"} school`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const areaOptions = areas.map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold font-kollektif text-text-primary">
            {mode === "create" ? "Create School" : "Edit School"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                  errors.name ? "border-red-500" : "border-border-light"
                }`}
                placeholder="e.g., Lincoln Elementary School"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                School Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => updateField("code", e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold"
                placeholder="e.g., LES001"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.area_id}
                onChange={(value) => updateField("area_id", value)}
                options={areaOptions}
                placeholder="Select area"
                error={errors.area_id}
              />
              {errors.area_id && <p className="text-red-500 text-xs mt-1">{errors.area_id}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                  errors.address ? "border-red-500" : "border-border-light"
                }`}
                placeholder="123 Main Street"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.city ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.state ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="NC"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  ZIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => updateField("zip_code", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.zip_code ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="12345"
                />
                {errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btn-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-btn-gold"></div>
              </label>
              <span className="text-sm font-medium font-manrope text-text-primary">Active</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold font-manrope text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-semibold font-manrope text-text-body bg-btn-gold rounded-lg hover:bg-btn-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create School"
                : "Update School"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
