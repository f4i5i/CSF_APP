import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import useClassForm from "../../hooks/useClassForm";

// Dummy data for dropdowns
const PROGRAMS = [
  { id: "1", name: "Soccer" },
  { id: "2", name: "Basketball" },
  { id: "3", name: "Tennis" },
  { id: "4", name: "Swimming" },
  { id: "5", name: "Gymnastics" },
];

const AREAS = [
  { id: "1", name: "Downtown" },
  { id: "2", name: "Midtown" },
  { id: "3", name: "Uptown" },
  { id: "4", name: "East Side" },
  { id: "5", name: "West Side" },
];

const DAYS = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" },
];

// Custom Dropdown Component
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
        className={`w-full px-3 py-2 border rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${
          error ? "border-btn-gold" : "border-border-light"
        }`}
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
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
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
      >
        <div className="max-h-48 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-btn-gold hover:text-heading-dark transition-colors ${
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

export default function ClassFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateSchedule,
    addSchedule,
    removeSchedule,
    updatePaymentOption,
    handleSubmit,
  } = useClassForm(initialData, mode);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(() => {
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <h2 className="text-2xl font-bold text-text-primary font-manrope">
            {mode === "create" ? "Create New Class" : "Edit Class"}
          </h2>
          <button
            onClick={onClose}
            className="text-btn-gold  transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form
          onSubmit={handleFormSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Class Name */}
                <div className="col-span-2">
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Class Name <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.name ? "border-btn-gold" : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="e.g., U10 After School Soccer"
                  />
                  {errors.name && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="Brief description of the class..."
                  />
                </div>
                {/* Program */}
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Program <span className="text-btn-gold">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.program_id}
                    onChange={(value) => updateField("program_id", value)}
                    options={PROGRAMS}
                    placeholder="Select Program"
                    error={errors.program_id}
                  />
                  {errors.program_id && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.program_id}
                    </p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Area/Location <span className="text-btn-gold">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.area_id}
                    onChange={(value) => updateField("area_id", value)}
                    options={AREAS}
                    placeholder="Select Area"
                    error={errors.area_id}
                  />
                  {errors.area_id && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.area_id}
                    </p>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Capacity <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => updateField("capacity", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.capacity
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="20"
                  />
                  {errors.capacity && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.capacity}
                    </p>
                  )}
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                      Min Age <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_age}
                      onChange={(e) => updateField("min_age", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.min_age
                          ? "border-btn-gold"
                          : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      placeholder="8"
                    />
                    {errors.min_age && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.min_age}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                      Max Age <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_age}
                      onChange={(e) => updateField("max_age", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.max_age
                          ? "border-btn-gold"
                          : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      placeholder="10"
                    />
                    {errors.max_age && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.max_age}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Start Date <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.start_date
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                  />
                  {errors.start_date && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    End Date <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.end_date
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                  />
                  {errors.end_date && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.end_date}
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        updateField("is_active", e.target.checked)
                      }
                      className="w-4 h-4 text-[#F3BC48] border-border-light rounded focus:ring-btn-gold"
                    />
                    <span className="text-sm font-medium text-heading-dark">
                      Active (visible to users)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold text-text-primary font-manrope border-border-light">
                  Schedule
                </h3>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm text-btn-secondary hover:text-[#e5ad35] font-semibold"
                >
                  + Add Schedule
                </button>
              </div>

              {formData.schedule.map((sched, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid sm:grid-cols-3 grid-cols-1 gap-3">
                    <div>
                        <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                          Day of Week
                        </label>
                        <CustomDropdown
                          value={sched.day_of_week}
                          onChange={(val) => updateSchedule(index, "day_of_week", val)}
                          options={DAYS}
                          placeholder="Select Day"
                          error={null}
                        />
                    </div>
                    <div>
                      <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={sched.start_time}
                        onChange={(e) =>
                          updateSchedule(index, "start_time", e.target.value)
                        }
                        className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      />
                    </div>
                    <div>
                      <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={sched.end_time}
                        onChange={(e) =>
                          updateSchedule(index, "end_time", e.target.value)
                        }
                        className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      />
                    </div>
                  </div>
                  {formData.schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="text-btn-gold hover:text-red-700 mt-6"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {errors.schedule && (
                <p className="text-btn-gold text-sm">{errors.schedule}</p>
              )}
            </div>

            {/* Payment Options Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Payment Options (Stripe)
              </h3>

              {errors.payment_options && (
                <div className="bg-red-50 border border-border-light text-error-dark px-4 py-3 rounded">
                  {errors.payment_options}
                </div>
              )}

              <div className="space-y-4">
                {/* Pay in Full */}
                <div className="border border-border-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.payment_options[0].enabled}
                        onChange={(e) =>
                          updatePaymentOption(0, "enabled", e.target.checked)
                        }
                        className="w-4 h-4 text-[#F3BC48] border-border-light rounded focus:ring-btn-gold"
                      />
                      <span className="font-semibold text-heading-dark font-manrope">
                        Pay in Full (One-time)
                      </span>
                    </label>
                  </div>
                  {formData.payment_options[0].enabled && (
                    <div>
                      <label className="block text-sm font-medium text-heading-dark font-manrope mb-1">
                        Price <span className="text-btn-gold">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.payment_options[0].price}
                        onChange={(e) =>
                          updatePaymentOption(0, "price", e.target.value)
                        }
                         className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                        placeholder="299.00"
                      />
                      {errors.payment_full_payment && (
                        <p className="text-error-darkest text-xs mt-1">
                          {errors.payment_full_payment}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Monthly Subscription */}
                <div className="border border-border-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.payment_options[1].enabled}
                        onChange={(e) =>
                          updatePaymentOption(1, "enabled", e.target.checked)
                        }
                        className="w-4 h-4 text-[#F3BC48] border-border-light rounded focus:ring-btn-gold"
                      />
                      <span className="font-semibold text-heading-dark font-manrope">
                        Monthly Subscription
                      </span>
                    </label>
                  </div>
                  {formData.payment_options[1].enabled && (
                    <div>
                      <label className="block text-sm font-medium text-heading-dark font-manrope mb-1">
                        Monthly Price <span className="text-btn-gold">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.payment_options[1].price}
                        onChange={(e) =>
                          updatePaymentOption(1, "price", e.target.value)
                        }
                         className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                        placeholder="69.00"
                      />
                      {errors.payment_monthly_subscription && (
                        <p className="text-error-darkest text-xs mt-1">
                          {errors.payment_monthly_subscription}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Installments */}
                <div className="border border-border-light rounded-lg p-4">
                  <h4 className="font-semibold text-heading-dark font-manrope mb-3">
                    Installment Plans
                  </h4>
                  <div className="space-y-3">
                    {[
                      { index: 2, label: "2 Months", type: "installment_2" },
                      { index: 3, label: "3 Months", type: "installment_3" },
                      { index: 4, label: "4 Months", type: "installment_4" },
                      { index: 5, label: "6 Months", type: "installment_6" },
                    ].map(({ index, label, type }) => (
                      <div key={index} className="flex items-center gap-4">
                        <label className="flex items-center space-x-2 w-32">
                          <input
                            type="checkbox"
                            checked={formData.payment_options[index].enabled}
                            onChange={(e) =>
                              updatePaymentOption(
                                index,
                                "enabled",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-[#F3BC48] border-border-light rounded focus:ring-btn-gold"
                          />
                          <span className="text-sm font-medium text-heading-dark">
                            {label}
                          </span>
                        </label>
                        {formData.payment_options[index].enabled && (
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payment_options[index].price}
                              onChange={(e) =>
                                updatePaymentOption(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                               className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                              placeholder="Monthly payment"
                            />
                            {errors[`payment_${type}`] && (
                              <p className="text-error-darkest text-xs mt-1">
                                {errors[`payment_${type}`]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border-light bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-text-primary font-manrope font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-btn-gold hover:bg-[#e5ad35] text-text-primary font-manrope rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Class"
                : "Update Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
