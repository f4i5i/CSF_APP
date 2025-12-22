/**
 * ProgramFormModal Component
 * Modal for creating and editing programs (Admin only)
 */

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import programsService from "../../api/services/programs.service";
import toast from "react-hot-toast";

export default function ProgramFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          is_active: initialData.is_active ?? true,
        });
      } else {
        setFormData({
          name: "",
          description: "",
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
      newErrors.name = "Program name is required";
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
        description: formData.description?.trim() || null,
        is_active: formData.is_active,
      };

      if (mode === "create") {
        await programsService.create(submitData);
        toast.success("Program created successfully");
      } else {
        await programsService.update(initialData.id, submitData);
        toast.success("Program updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save program:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        `Failed to ${mode === "create" ? "create" : "update"} program`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            {mode === "create" ? "Create Program" : "Edit Program"}
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
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                  errors.name ? "border-red-500" : "border-border-light"
                }`}
                placeholder="e.g., Basketball, Soccer, etc."
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold resize-none"
                placeholder="Brief description of the program..."
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-btn-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-btn-gold"></div>
              </label>
              <span className="text-sm font-medium font-manrope text-text-primary">
                Active
              </span>
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
                ? "Create Program"
                : "Update Program"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
