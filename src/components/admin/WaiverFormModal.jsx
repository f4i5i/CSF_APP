/**
 * WaiverFormModal - Create/Edit Waiver Template Modal
 * Admin component for creating and editing waiver templates
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import waiversService from '../../api/services/waivers.service';
import { useApi } from '../../hooks';
import { programsService } from '../../api/services';

const WAIVER_TYPES = [
  { value: 'liability', label: 'Liability Waiver' },
  { value: 'medical_release', label: 'Medical Release' },
  { value: 'photo_release', label: 'Photo Release' },
  { value: 'cancellation_policy', label: 'Cancellation Policy' },
];

const WaiverFormModal = ({ waiver = null, onClose, onSuccess }) => {
  const isEdit = !!waiver;

  const [formData, setFormData] = useState({
    name: '',
    waiver_type: 'liability',
    content: '',
    is_active: true,
    is_required: true,
    applies_to_program_id: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load programs for scoping
  const { data: programs = [] } = useApi(() => programsService.getAll(), {
    initialData: [],
  });

  // Populate form if editing
  useEffect(() => {
    if (waiver) {
      setFormData({
        name: waiver.name || '',
        waiver_type: waiver.waiver_type || 'liability',
        content: waiver.content || '',
        is_active: waiver.is_active !== undefined ? waiver.is_active : true,
        is_required: waiver.is_required !== undefined ? waiver.is_required : true,
        applies_to_program_id: waiver.applies_to_program_id || '',
      });
    }
  }, [waiver]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Waiver name is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Waiver content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data
      const data = {
        name: formData.name.trim(),
        waiver_type: formData.waiver_type,
        content: formData.content.trim(),
        is_active: formData.is_active,
        is_required: formData.is_required,
        applies_to_program_id: formData.applies_to_program_id || null,
      };

      if (isEdit) {
        await waiversService.updateTemplate(waiver.id, data);
        toast.success('Waiver template updated successfully!');
      } else {
        await waiversService.createTemplate(data);
        toast.success('Waiver template created successfully!');
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Failed to save waiver:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${isEdit ? 'update' : 'create'} waiver template`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#173151]">
            {isEdit ? 'Edit Waiver Template' : 'Create New Waiver Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Waiver Template Guidelines
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Global waivers apply to all users (leave program field empty)</li>
                    <li>Program-specific waivers only apply to that program</li>
                    <li>
                      Content changes will increment version and require users to re-sign
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waiver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Liability Waiver 2024"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#173151] outline-none ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Waiver Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waiver Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="waiver_type"
                  value={formData.waiver_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
                  required
                >
                  {WAIVER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waiver Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter the full waiver text here..."
                rows={12}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#173151] outline-none font-mono text-sm ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Use plain text or simple formatting. This is what users will see.
              </p>
            </div>

            {/* Scope (Optional) */}
            <div>
              {/* Program Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply to Program (Optional)
                </label>
                <select
                  name="applies_to_program_id"
                  value={formData.applies_to_program_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
                >
                  <option value="">All Programs (Global)</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for global waiver
                </p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {/* Is Required */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_required"
                  checked={formData.is_required}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#173151] border-gray-300 rounded focus:ring-[#173151]"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    Required Waiver
                  </span>
                  <p className="text-sm text-gray-600">
                    Users must sign this waiver before enrollment
                  </p>
                </div>
              </label>

              {/* Is Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#173151] border-gray-300 rounded focus:ring-[#173151]"
                />
                <div>
                  <span className="font-medium text-gray-900">Active</span>
                  <p className="text-sm text-gray-600">
                    Only active waivers are shown to users
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#173151] text-white rounded-lg font-semibold hover:bg-[#1f3d67] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update Waiver' : 'Create Waiver'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WaiverFormModal;
