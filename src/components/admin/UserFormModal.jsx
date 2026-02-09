/**
 * UserFormModal Component
 * Modal for creating and editing users (Admin only)
 */

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import usersService from "../../api/services/users.service";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

// All available roles
const ALL_ROLES = [
  { id: "parent", name: "Parent" },
  { id: "coach", name: "Coach" },
  { id: "admin", name: "Admin" },
  { id: "owner", name: "Owner" },
];

// Roles that admin can assign (not owner)
const ADMIN_ASSIGNABLE_ROLES = [
  { id: "parent", name: "Parent" },
  { id: "coach", name: "Coach" },
];

function CustomDropdown({ value, onChange, options, placeholder, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${
          error ? "border-red-500" : "border-border-light"
        }`}
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span
          className={`text-sm ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {displayText}
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
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
      >
        <div className="max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-btn-gold hover:text-heading-dark transition-colors text-sm ${
                value === option.id
                  ? "bg-btn-gold text-text-primary"
                  : "text-heading-dark"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function UserFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "parent",
    password: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine which roles the current user can assign
  const isOwner = currentUser?.role === "owner";
  const availableRoles = isOwner ? ALL_ROLES : ADMIN_ASSIGNABLE_ROLES;

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          email: initialData.email || "",
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          phone: initialData.phone || "",
          role: initialData.role || "parent",
          password: "",
          is_active: initialData.is_active ?? true,
        });
      } else {
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "parent",
          password: "",
          is_active: true,
        });
      }
      setErrors({});
      setShowPassword(false);
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

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (mode === "create" && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one digit";
      }
    }

    if (mode === "edit" && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one digit";
      }
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
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone?.trim() || null,
        role: formData.role,
        is_active: formData.is_active,
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      if (mode === "create") {
        await usersService.create(submitData);
        toast.success("User created successfully. A welcome email with login instructions has been sent.");
      } else {
        await usersService.updateUser(initialData.id, submitData);
        toast.success("User updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save user:", error);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        `Failed to ${mode === "create" ? "create" : "update"} user`;
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
            {mode === "create" ? "Create User" : "Edit User"}
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
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                  errors.email ? "border-red-500" : "border-border-light"
                }`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.first_name ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.last_name ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.role}
                onChange={(value) => updateField("role", value)}
                options={availableRoles}
                placeholder="Select role"
                error={errors.role}
              />
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
              {!isOwner && (
                <p className="text-xs text-gray-500 mt-1">
                  Only owners can assign admin or owner roles
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                Password {mode === "create" && "(optional)"}
                {mode === "edit" && "(leave blank to keep current)"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.password ? "border-red-500" : "border-border-light"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with uppercase, lowercase, and a digit
              </p>
              {mode === "create" && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    A welcome email with a password setup link will be sent to the user automatically.
                  </p>
                </div>
              )}
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
              <span className="text-sm font-manrope text-text-primary">
                Active Account
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
                ? "Create User"
                : "Update User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
