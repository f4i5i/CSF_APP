/**
 * ClassFormModal Component
 * Modal for creating and editing classes with payment configuration
 */

import React from 'react';
import { X } from 'lucide-react';
import useClassForm from '../../hooks/useClassForm';

export default function ClassFormModal({ isOpen, onClose, mode = 'create', initialData = null, onSuccess }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#173151] font-manrope">
            {mode === 'create' ? 'Create New Class' : 'Edit Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#173151] font-manrope border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Class Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., U10 After School Soccer"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                    placeholder="Brief description of the class..."
                  />
                </div>

                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.program_id}
                    onChange={(e) => updateField('program_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.program_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Program</option>
                    {/* TODO: Fetch from API */}
                  </select>
                  {errors.program_id && <p className="text-red-500 text-xs mt-1">{errors.program_id}</p>}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => updateField('area_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.area_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Area</option>
                    {/* TODO: Fetch from API */}
                  </select>
                  {errors.area_id && <p className="text-red-500 text-xs mt-1">{errors.area_id}</p>}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => updateField('capacity', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="20"
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_age}
                      onChange={(e) => updateField('min_age', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                        errors.min_age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="8"
                    />
                    {errors.min_age && <p className="text-red-500 text-xs mt-1">{errors.min_age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_age}
                      onChange={(e) => updateField('max_age', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                        errors.max_age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10"
                    />
                    {errors.max_age && <p className="text-red-500 text-xs mt-1">{errors.max_age}</p>}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.start_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48] ${
                      errors.end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                </div>

                {/* Active Status */}
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => updateField('is_active', e.target.checked)}
                      className="w-4 h-4 text-[#F3BC48] border-gray-300 rounded focus:ring-[#F3BC48]"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-[#173151] font-manrope">
                  Schedule
                </h3>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm text-[#F3BC48] hover:text-[#e5ad35] font-semibold"
                >
                  + Add Schedule
                </button>
              </div>

              {formData.schedule.map((sched, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Day of Week
                      </label>
                      <select
                        value={sched.day_of_week}
                        onChange={(e) => updateSchedule(index, 'day_of_week', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={sched.start_time}
                        onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={sched.end_time}
                        onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                      />
                    </div>
                  </div>
                  {formData.schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="text-red-500 hover:text-red-700 mt-6"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule}</p>}
            </div>

            {/* Payment Options Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#173151] font-manrope border-b pb-2">
                Payment Options (Stripe)
              </h3>

              {errors.payment_options && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.payment_options}
                </div>
              )}

              <div className="space-y-4">
                {/* Pay in Full */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.payment_options[0].enabled}
                        onChange={(e) => updatePaymentOption(0, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-[#F3BC48] border-gray-300 rounded focus:ring-[#F3BC48]"
                      />
                      <span className="font-semibold text-gray-800">Pay in Full (One-time)</span>
                    </label>
                  </div>
                  {formData.payment_options[0].enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.payment_options[0].price}
                        onChange={(e) => updatePaymentOption(0, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                        placeholder="299.00"
                      />
                      {errors.payment_full_payment && (
                        <p className="text-red-500 text-xs mt-1">{errors.payment_full_payment}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Monthly Subscription */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.payment_options[1].enabled}
                        onChange={(e) => updatePaymentOption(1, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-[#F3BC48] border-gray-300 rounded focus:ring-[#F3BC48]"
                      />
                      <span className="font-semibold text-gray-800">Monthly Subscription</span>
                    </label>
                  </div>
                  {formData.payment_options[1].enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.payment_options[1].price}
                        onChange={(e) => updatePaymentOption(1, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                        placeholder="69.00"
                      />
                      {errors.payment_monthly_subscription && (
                        <p className="text-red-500 text-xs mt-1">{errors.payment_monthly_subscription}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Installments */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Installment Plans</h4>
                  <div className="space-y-3">
                    {[
                      { index: 2, label: '2 Months', type: 'installment_2' },
                      { index: 3, label: '3 Months', type: 'installment_3' },
                      { index: 4, label: '4 Months', type: 'installment_4' },
                      { index: 5, label: '6 Months', type: 'installment_6' },
                    ].map(({ index, label, type }) => (
                      <div key={index} className="flex items-center gap-4">
                        <label className="flex items-center space-x-2 w-32">
                          <input
                            type="checkbox"
                            checked={formData.payment_options[index].enabled}
                            onChange={(e) => updatePaymentOption(index, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-[#F3BC48] border-gray-300 rounded focus:ring-[#F3BC48]"
                          />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                        {formData.payment_options[index].enabled && (
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payment_options[index].price}
                              onChange={(e) => updatePaymentOption(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3BC48]"
                              placeholder="Monthly payment"
                            />
                            {errors[`payment_${type}`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`payment_${type}`]}</p>
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
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#F3BC48] hover:bg-[#e5ad35] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Class' : 'Update Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
