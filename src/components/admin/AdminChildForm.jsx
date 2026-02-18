import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import childrenService from "../../api/services/children.service";

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5"];
const JERSEY_SIZES = ["xs", "s", "m", "l", "xl", "xxl"];
const RELATION_OPTIONS = ["Parent", "Guardian", "Grandparent", "Sibling", "Other"];

export default function AdminChildForm({ isOpen, onClose, mode = "create", initialData = null, parentId = null, parentName = null, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    grade: "",
    jersey_size: "",
    medical_conditions: "",
    after_school_attendance: false,
    health_insurance_number: "",
    emergency_name: "",
    emergency_phone: "",
    emergency_relation: "",
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const emergencyContact = initialData.emergency_contacts?.[0] || {};
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split("T")[0] : "",
        grade: initialData.grade || "",
        jersey_size: initialData.jersey_size || "",
        medical_conditions: initialData.medical_conditions || "",
        after_school_attendance: initialData.after_school_attendance || false,
        health_insurance_number: initialData.health_insurance_number || "",
        emergency_name: emergencyContact.name || "",
        emergency_phone: emergencyContact.phone || "",
        emergency_relation: emergencyContact.relation || emergencyContact.relationship || "",
      });
    } else if (mode === "create") {
      setForm({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        grade: "",
        jersey_size: "",
        medical_conditions: "",
        after_school_attendance: false,
        health_insurance_number: "",
        emergency_name: "",
        emergency_phone: "",
        emergency_relation: "",
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!form.grade) newErrors.grade = "Grade is required";
    if (!form.jersey_size) newErrors.jersey_size = "Jersey size is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const childData = {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        grade: form.grade,
        jersey_size: form.jersey_size.toLowerCase(),
        medical_conditions: form.medical_conditions || null,
        has_no_medical_conditions: !form.medical_conditions,
        after_school_attendance: form.after_school_attendance,
        after_school_program: form.after_school_attendance ? "Default Program" : null,
        health_insurance_number: form.health_insurance_number || null,
        emergency_contacts: form.emergency_name
          ? [
              {
                name: form.emergency_name,
                relation: form.emergency_relation || "Other",
                phone: form.emergency_phone,
                is_primary: true,
              },
            ]
          : [],
      };

      // For admin creating a child under a parent, include parent_id
      if (mode === "create" && parentId) {
        childData.parent_id = parentId;
      }

      if (mode === "edit" && initialData?.id) {
        await childrenService.update(initialData.id, childData);
        toast.success("Child updated successfully");
      } else {
        await childrenService.create(childData);
        toast.success("Child created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save child:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `Failed to ${mode === "edit" ? "update" : "create"} child`;
      toast.error(typeof errorMessage === "string" ? errorMessage : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) =>
    `w-full mt-1 p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-transparent bg-white ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

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
          <div>
            <h2 className="text-xl font-bold font-kollektif text-text-primary">
              {mode === "create" ? "Add Child" : "Edit Child"}
            </h2>
            {parentName && (
              <p className="text-sm text-text-muted font-manrope mt-0.5">
                Parent: {parentName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">First Name *</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} className={inputStyle("first_name")} />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Last Name *</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} className={inputStyle("last_name")} />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Date of Birth *</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className={inputStyle("date_of_birth")} />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>

            {/* Grade */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Grade *</label>
              <select name="grade" value={form.grade} onChange={handleChange} className={inputStyle("grade")}>
                <option value="">Select grade</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>

            {/* Jersey Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Jersey Size *</label>
              <select name="jersey_size" value={form.jersey_size} onChange={handleChange} className={inputStyle("jersey_size")}>
                <option value="">Select size</option>
                {JERSEY_SIZES.map((s) => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
              {errors.jersey_size && <p className="text-red-500 text-xs mt-1">{errors.jersey_size}</p>}
            </div>

            {/* After School */}
            <div className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                name="after_school_attendance"
                checked={form.after_school_attendance}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[#F3BC48] focus:ring-[#F3BC48]"
              />
              <label className="text-sm font-medium text-gray-700 font-manrope">Attends Afterschool</label>
            </div>

            {/* Medical Conditions */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 font-manrope">Medical Conditions</label>
              <textarea name="medical_conditions" value={form.medical_conditions} onChange={handleChange} className={inputStyle("medical_conditions")} rows={2} placeholder="Any medical conditions or allergies..." />
            </div>

            {/* Insurance */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 font-manrope">Health Insurance # (optional)</label>
              <input type="text" name="health_insurance_number" value={form.health_insurance_number} onChange={handleChange} className={inputStyle("health_insurance_number")} />
            </div>

            {/* Emergency Contact Section */}
            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 font-manrope mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 font-manrope">Name</label>
                  <input type="text" name="emergency_name" value={form.emergency_name} onChange={handleChange} className={inputStyle("emergency_name")} placeholder="Contact name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 font-manrope">Phone</label>
                  <input type="tel" name="emergency_phone" value={form.emergency_phone} onChange={handleChange} className={inputStyle("emergency_phone")} placeholder="+1234567890" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 font-manrope">Relation</label>
                  <select name="emergency_relation" value={form.emergency_relation} onChange={handleChange} className={inputStyle("emergency_relation")}>
                    <option value="">Select relation</option>
                    {RELATION_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-manrope"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-[#173151] bg-[#F3BC48] hover:bg-[#e5a920] rounded-lg transition-colors font-manrope disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Add Child"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
