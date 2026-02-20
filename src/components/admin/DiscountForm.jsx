import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import discountsService from "../../api/services/discounts.service";
import adminService from "../../api/services/admin.service";

export default function DiscountForm({ isOpen, onClose, mode = "create", initialData = null, programs = [], classes = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
    max_uses: "",
    max_uses_per_user: "",
    min_order_amount: "",
    applies_to_program_id: "",
    applies_to_class_id: "",
    is_active: true,
    duration: "once",
    duration_in_months: "",
    first_time_only: false,
    restricted_to_user_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchingClients, setSearchingClients] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        code: initialData.code || "",
        description: initialData.description || "",
        discount_type: initialData.discount_type || "percentage",
        discount_value: initialData.discount_value || "",
        valid_from: initialData.valid_from ? new Date(initialData.valid_from).toISOString().split("T")[0] : "",
        valid_until: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split("T")[0] : "",
        max_uses: initialData.max_uses || "",
        max_uses_per_user: initialData.max_uses_per_user || "",
        min_order_amount: initialData.min_order_amount || "",
        applies_to_program_id: initialData.applies_to_program_id || "",
        applies_to_class_id: initialData.applies_to_class_id || "",
        is_active: initialData.is_active ?? true,
        duration: initialData.duration || "once",
        duration_in_months: initialData.duration_in_months || "",
        first_time_only: initialData.first_time_only ?? false,
        restricted_to_user_ids: initialData.restricted_to_user_ids || [],
      });
      setSelectedClients([]);
    } else if (mode === "create") {
      setForm({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        valid_from: new Date().toISOString().split("T")[0],
        valid_until: "",
        max_uses: "",
        max_uses_per_user: "",
        min_order_amount: "",
        applies_to_program_id: "",
        applies_to_class_id: "",
        is_active: true,
        duration: "once",
        duration_in_months: "",
        first_time_only: false,
        restricted_to_user_ids: [],
      });
      setSelectedClients([]);
    }
    setErrors({});
    setClientSearch("");
    setClientResults([]);
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
    if (!form.code.trim()) newErrors.code = "Code is required";
    else if (form.code.trim().length < 3) newErrors.code = "Code must be at least 3 characters";
    else if (form.code.trim().length > 40) newErrors.code = "Code must be at most 40 characters";
    if (!form.discount_value || Number(form.discount_value) <= 0) newErrors.discount_value = "Value must be greater than 0";
    if (form.discount_type === "percentage" && Number(form.discount_value) > 100) {
      newErrors.discount_value = "Percentage cannot exceed 100";
    }
    if (!form.valid_from) newErrors.valid_from = "Start date is required";
    if (form.duration === "repeating" && (!form.duration_in_months || Number(form.duration_in_months) < 1)) {
      newErrors.duration_in_months = "Number of months is required for repeating duration";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        valid_from: new Date(form.valid_from).toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        max_uses_per_user: form.max_uses_per_user ? Number(form.max_uses_per_user) : null,
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        applies_to_program_id: form.applies_to_program_id || null,
        applies_to_class_id: form.applies_to_class_id || null,
        duration: form.duration,
        duration_in_months: form.duration === "repeating" ? Number(form.duration_in_months) : null,
        first_time_only: form.first_time_only,
        restricted_to_user_ids: form.restricted_to_user_ids.length > 0 ? form.restricted_to_user_ids : null,
      };

      if (mode === "edit" && initialData?.id) {
        const updatePayload = {
          description: payload.description,
          valid_until: payload.valid_until,
          max_uses: payload.max_uses,
          is_active: form.is_active,
          first_time_only: form.first_time_only,
          restricted_to_user_ids: form.restricted_to_user_ids.length > 0 ? form.restricted_to_user_ids : null,
        };
        await discountsService.update(initialData.id, updatePayload);
        toast.success("Discount code updated");
      } else {
        await discountsService.create(payload);
        toast.success("Discount code created");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save discount:", error);
      const msg = error.response?.data?.detail || error.response?.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} discount`;
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSearch = async (query) => {
    setClientSearch(query);
    if (query.length < 2) {
      setClientResults([]);
      return;
    }
    setSearchingClients(true);
    try {
      const clients = await adminService.getClients({ search: query });
      const items = clients?.items || clients || [];
      // Filter out already selected clients
      setClientResults(items.filter((c) => !form.restricted_to_user_ids.includes(c.user_id || c.id)));
    } catch {
      setClientResults([]);
    } finally {
      setSearchingClients(false);
    }
  };

  const addClient = (client) => {
    const userId = client.user_id || client.id;
    setForm((prev) => ({
      ...prev,
      restricted_to_user_ids: [...prev.restricted_to_user_ids, userId],
    }));
    setSelectedClients((prev) => [...prev, { id: userId, name: `${client.first_name || ""} ${client.last_name || ""}`.trim(), email: client.email }]);
    setClientSearch("");
    setClientResults([]);
  };

  const removeClient = (userId) => {
    setForm((prev) => ({
      ...prev,
      restricted_to_user_ids: prev.restricted_to_user_ids.filter((id) => id !== userId),
    }));
    setSelectedClients((prev) => prev.filter((c) => c.id !== userId));
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
          <h2 className="text-xl font-bold font-kollektif text-text-primary">
            {mode === "create" ? "Create Discount Code" : "Edit Discount Code"}
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Code *</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className={inputStyle("code")}
                placeholder="e.g. SUMMER25"
                maxLength={40}
                disabled={mode === "edit"}
                style={{ textTransform: "uppercase" }}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.code ? <p className="text-red-500 text-xs">{errors.code}</p> : <span />}
                <span className={`text-xs ${form.code.length > 35 ? "text-orange-500" : "text-gray-400"}`}>{form.code.length}/40</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} className={inputStyle("description")} placeholder="Summer 2025 promotion" />
            </div>

            {/* Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Type *</label>
                <select name="discount_type" value={form.discount_type} onChange={handleChange} className={inputStyle("discount_type")} disabled={mode === "edit"}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">
                  Value * {form.discount_type === "percentage" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  name="discount_value"
                  value={form.discount_value}
                  onChange={handleChange}
                  className={inputStyle("discount_value")}
                  placeholder={form.discount_type === "percentage" ? "25" : "10.00"}
                  min="0"
                  step={form.discount_type === "percentage" ? "1" : "0.01"}
                  disabled={mode === "edit"}
                />
                {errors.discount_value && <p className="text-red-500 text-xs mt-1">{errors.discount_value}</p>}
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Valid From *</label>
                <input type="date" name="valid_from" value={form.valid_from} onChange={handleChange} className={inputStyle("valid_from")} disabled={mode === "edit"} />
                {errors.valid_from && <p className="text-red-500 text-xs mt-1">{errors.valid_from}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Valid Until</label>
                <input type="date" name="valid_until" value={form.valid_until} onChange={handleChange} className={inputStyle("valid_until")} />
                <p className="text-xs text-gray-400 mt-0.5">Leave empty for no expiry</p>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Max Total Uses</label>
                <input type="number" name="max_uses" value={form.max_uses} onChange={handleChange} className={inputStyle("max_uses")} placeholder="Unlimited" min="1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Max Per User</label>
                <input type="number" name="max_uses_per_user" value={form.max_uses_per_user} onChange={handleChange} className={inputStyle("max_uses_per_user")} placeholder="Unlimited" min="1" disabled={mode === "edit"} />
              </div>
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700 font-manrope">Minimum Order Amount ($)</label>
              <input type="number" name="min_order_amount" value={form.min_order_amount} onChange={handleChange} className={inputStyle("min_order_amount")} placeholder="No minimum" min="0" step="0.01" disabled={mode === "edit"} />
            </div>

            {/* Program/Class Restriction */}
            {(programs.length > 0 || classes.length > 0) && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 font-manrope mb-3">Restrictions (optional)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {programs.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 font-manrope">Restrict to Program</label>
                      <select name="applies_to_program_id" value={form.applies_to_program_id} onChange={handleChange} className={inputStyle("applies_to_program_id")} disabled={mode === "edit"}>
                        <option value="">All Programs</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {classes.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 font-manrope">Restrict to Class</label>
                      <select name="applies_to_class_id" value={form.applies_to_class_id} onChange={handleChange} className={inputStyle("applies_to_class_id")} disabled={mode === "edit"}>
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stripe Subscription Duration */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 font-manrope mb-3">Subscription Duration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">Duration</label>
                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className={inputStyle("duration")}
                    disabled={mode === "edit"}
                  >
                    <option value="once">One-time</option>
                    <option value="repeating">Repeating (N months)</option>
                    <option value="forever">Forever</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-0.5">How long discount applies to subscriptions</p>
                </div>
                {form.duration === "repeating" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 font-manrope">Months *</label>
                    <input
                      type="number"
                      name="duration_in_months"
                      value={form.duration_in_months}
                      onChange={handleChange}
                      className={inputStyle("duration_in_months")}
                      placeholder="e.g. 3"
                      min="1"
                      max="36"
                      disabled={mode === "edit"}
                    />
                    {errors.duration_in_months && <p className="text-red-500 text-xs mt-1">{errors.duration_in_months}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Restrictions */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 font-manrope mb-3">Advanced Restrictions</h3>

              {/* First-time only */}
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  name="first_time_only"
                  checked={form.first_time_only}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#F3BC48] focus:ring-[#F3BC48]"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 font-manrope">First-time customers only</label>
                  <p className="text-xs text-gray-400">Only valid for customers who haven't made a purchase before</p>
                </div>
              </div>

              {/* Restrict to specific parents */}
              <div>
                <label className="text-sm font-medium text-gray-700 font-manrope">Restrict to specific parents</label>
                <p className="text-xs text-gray-400 mb-2">Leave empty to allow all parents</p>

                {/* Selected parents */}
                {selectedClients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedClients.map((client) => (
                      <span
                        key={client.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {client.name || client.email}
                        <button type="button" onClick={() => removeClient(client.id)} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {form.restricted_to_user_ids.length > 0 && selectedClients.length === 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    {form.restricted_to_user_ids.length} parent(s) restricted
                  </p>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-transparent"
                    placeholder="Search parents by name or email..."
                  />
                  {searchingClients && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
                </div>

                {/* Search results dropdown */}
                {clientResults.length > 0 && (
                  <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {clientResults.map((client) => (
                      <button
                        key={client.user_id || client.id}
                        type="button"
                        onClick={() => addClient(client)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-700">
                          {client.first_name} {client.last_name}
                        </span>
                        <span className="text-xs text-gray-400">{client.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Toggle (edit only) */}
            {mode === "edit" && (
              <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#F3BC48] focus:ring-[#F3BC48]"
                />
                <label className="text-sm font-medium text-gray-700 font-manrope">Active</label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-manrope">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-[#173151] bg-[#F3BC48] hover:bg-[#e5a920] rounded-lg transition-colors font-manrope disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Create Code"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
