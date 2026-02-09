/**
 * EnrollmentFormModal Component
 * Modal for creating and editing enrollments (Admin only)
 */

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import enrollmentsService from "../../api/services/enrollments.service";
import classesService from "../../api/services/classes.service";
import childrenService from "../../api/services/children.service";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { id: "active", name: "Active" },
  { id: "pending", name: "Pending" },
  { id: "completed", name: "Completed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "waitlisted", name: "Waitlisted" },
];

const PAYMENT_OPTIONS = [
  { id: "full_payment", name: "Pay in Full" },
  { id: "monthly_subscription", name: "Monthly Subscription" },
  { id: "installment_2", name: "2 Month Installment" },
  { id: "installment_3", name: "3 Month Installment" },
  { id: "installment_4", name: "4 Month Installment" },
  { id: "installment_6", name: "6 Month Installment" },
];

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
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span
          className={`text-sm truncate ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {displayText}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
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
                  value === option.id
                    ? "bg-btn-gold text-text-primary"
                    : "text-heading-dark"
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

export default function EnrollmentFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    child_id: "",
    class_id: "",
    status: "active",
    base_price: "",
    discount_amount: "0",
    final_price: "",
    auto_charge: false,
    payment_option: "full_payment",
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [classes, setClasses] = useState([]);
  const [children, setChildren] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();

      if (mode === "edit" && initialData) {
        setFormData({
          child_id: initialData.child_id || "",
          class_id: initialData.class_id || "",
          status: initialData.status || "active",
          base_price: initialData.base_price?.toString() || "",
          discount_amount: initialData.discount_amount?.toString() || "0",
          final_price: initialData.final_price?.toString() || "",
          auto_charge: false,
          payment_option: "full_payment",
        });
      } else {
        setFormData({
          child_id: "",
          class_id: "",
          status: "active",
          base_price: "",
          discount_amount: "0",
          final_price: "",
          auto_charge: false,
          payment_option: "full_payment",
        });
      }
      setPaymentMethod(null);
      setErrors({});
    }
  }, [isOpen, mode, initialData]);

  const fetchDropdownData = async () => {
    setLoadingData(true);
    try {
      // Fetch classes (required)
      const classesRes = await classesService.getAll({ limit: 200 });
      setClasses(
        (classesRes.items || []).map((c) => ({
          id: c.id,
          name: `${c.name} (${c.current_enrollment || 0}/${c.capacity || 0})`,
          base_price: c.base_price,
        }))
      );

      // Fetch children separately (optional - gracefully handle failure)
      try {
        if (childrenService.getAll) {
          const childrenRes = await childrenService.getAll({ limit: 200 });
          if (childrenRes.items) {
            setChildren(
              childrenRes.items.map((c) => ({
                id: c.id,
                name: `${c.first_name} ${c.last_name}`,
              }))
            );
          }
        }
      } catch (childrenError) {
        console.warn("Could not fetch children list:", childrenError);
        // Children dropdown will fall back to manual ID input
      }
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch parent's payment method when child is selected
  const fetchPaymentMethod = async (childId) => {
    if (!childId) {
      setPaymentMethod(null);
      return;
    }
    setLoadingPaymentMethod(true);
    try {
      const result = await enrollmentsService.getParentPaymentMethod(childId);
      setPaymentMethod(result);
    } catch (error) {
      console.warn("Could not fetch payment method:", error);
      setPaymentMethod(null);
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate final price
      if (field === "base_price" || field === "discount_amount") {
        const base = parseFloat(updated.base_price) || 0;
        const discount = parseFloat(updated.discount_amount) || 0;
        updated.final_price = Math.max(0, base - discount).toFixed(2);
      }

      // Auto-fill base_price when class is selected
      if (field === "class_id" && value) {
        const selectedClass = classes.find((c) => c.id === value);
        if (selectedClass && selectedClass.base_price) {
          updated.base_price = selectedClass.base_price.toString();
          const discount = parseFloat(updated.discount_amount) || 0;
          updated.final_price = Math.max(0, parseFloat(selectedClass.base_price) - discount).toFixed(2);
        }
      }

      // Fetch payment method when child is selected
      if (field === "child_id" && value) {
        fetchPaymentMethod(value);
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.child_id?.trim()) {
      newErrors.child_id = "Child is required";
    }

    if (!formData.class_id?.trim()) {
      newErrors.class_id = "Class is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
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
      let submitData;

      if (mode === "create") {
        // Create: include child_id and class_id
        submitData = {
          child_id: formData.child_id.trim(),
          class_id: formData.class_id.trim(),
          status: formData.status,
        };

        if (formData.base_price) {
          submitData.base_price = parseFloat(formData.base_price);
        }
        if (formData.discount_amount) {
          submitData.discount_amount = parseFloat(formData.discount_amount);
        }
        if (formData.final_price) {
          submitData.final_price = parseFloat(formData.final_price);
        }

        // If auto-charge is enabled, use adminEnroll endpoint
        if (formData.auto_charge && paymentMethod) {
          submitData.auto_charge = true;
          submitData.payment_option_type = formData.payment_option;
          submitData.amount = parseFloat(formData.final_price) || parseFloat(formData.base_price);

          await enrollmentsService.adminEnroll(submitData);
          toast.success("Enrollment created and payment charged successfully");
        } else {
          await enrollmentsService.create(submitData);
          toast.success("Enrollment created successfully");
        }
      } else {
        // Update: only send status and pricing fields
        submitData = {
          status: formData.status,
        };

        if (formData.base_price) {
          submitData.base_price = parseFloat(formData.base_price);
        }
        if (formData.discount_amount !== undefined && formData.discount_amount !== "") {
          submitData.discount_amount = parseFloat(formData.discount_amount);
        }
        if (formData.final_price) {
          submitData.final_price = parseFloat(formData.final_price);
        }

        await enrollmentsService.update(initialData.id, submitData);
        toast.success("Enrollment updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save enrollment:", error);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        `Failed to ${mode === "create" ? "create" : "update"} enrollment`;
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
            {mode === "create" ? "Create Enrollment" : "Edit Enrollment"}
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
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn-gold"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Child Selection */}
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  Child <span className="text-red-500">*</span>
                </label>
                {children.length > 0 ? (
                  <CustomDropdown
                    value={formData.child_id}
                    onChange={(value) => updateField("child_id", value)}
                    options={children}
                    placeholder="Select child"
                    error={errors.child_id}
                    disabled={mode === "edit"}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.child_id}
                    onChange={(e) => updateField("child_id", e.target.value)}
                    disabled={mode === "edit"}
                    className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.child_id ? "border-red-500" : "border-border-light"
                    } ${mode === "edit" ? "opacity-50 cursor-not-allowed" : ""}`}
                    placeholder="Enter child ID"
                  />
                )}
                {errors.child_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.child_id}</p>
                )}
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  value={formData.class_id}
                  onChange={(value) => updateField("class_id", value)}
                  options={classes}
                  placeholder="Select class"
                  error={errors.class_id}
                  disabled={mode === "edit"}
                />
                {errors.class_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold font-manrope text-text-primary mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  value={formData.status}
                  onChange={(value) => updateField("status", value)}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                  error={errors.status}
                />
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold font-manrope text-text-primary mb-3">
                  Pricing (Optional)
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium font-manrope text-gray-600 mb-1">
                      Base Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.base_price}
                        onChange={(e) => updateField("base_price", e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium font-manrope text-gray-600 mb-1">
                      Discount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discount_amount}
                        onChange={(e) => updateField("discount_amount", e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium font-manrope text-gray-600 mb-1">
                      Final Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.final_price}
                        onChange={(e) => updateField("final_price", e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-border-light rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Charge Section (Create mode only) */}
              {mode === "create" && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold font-manrope text-text-primary mb-3">
                    Payment
                  </h3>

                  {/* Payment Method Display */}
                  {loadingPaymentMethod && (
                    <div className="text-sm text-gray-500 mb-3">
                      Loading parent's payment method...
                    </div>
                  )}

                  {!loadingPaymentMethod && formData.child_id && (
                    <div className="mb-3">
                      {paymentMethod ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">
                              Default Payment Method:
                            </span>
                            <span className="text-sm text-green-700">
                              {paymentMethod.brand} •••• {paymentMethod.last4}
                              {paymentMethod.exp_month && paymentMethod.exp_year && (
                                <span className="text-gray-500 ml-2">
                                  (Exp: {paymentMethod.exp_month}/{paymentMethod.exp_year})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm text-yellow-800">
                              No default payment method found. Auto-charge not available.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auto-charge toggle */}
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.auto_charge}
                      onChange={(e) => updateField("auto_charge", e.target.checked)}
                      disabled={!paymentMethod}
                      className="w-4 h-4 text-btn-gold border-gray-300 rounded focus:ring-btn-gold disabled:opacity-50"
                    />
                    <span className={`text-sm font-medium ${!paymentMethod ? 'text-gray-400' : 'text-gray-700'}`}>
                      Automatically charge parent's default payment method
                    </span>
                  </label>

                  {/* Payment Option Selection (when auto-charge is enabled) */}
                  {formData.auto_charge && (
                    <div>
                      <label className="block text-xs font-medium font-manrope text-gray-600 mb-1">
                        Payment Type
                      </label>
                      <CustomDropdown
                        value={formData.payment_option}
                        onChange={(value) => updateField("payment_option", value)}
                        options={PAYMENT_OPTIONS}
                        placeholder="Select payment type"
                      />
                      {formData.final_price && (
                        <p className="text-xs text-gray-500 mt-2">
                          Amount to charge: <span className="font-semibold">${parseFloat(formData.final_price).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
              disabled={isSubmitting || loadingData}
              className="px-6 py-2 text-sm font-semibold font-manrope text-text-body bg-btn-gold rounded-lg hover:bg-btn-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Enrollment"
                : "Update Enrollment"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
