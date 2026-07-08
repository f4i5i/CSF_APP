/**
 * EditContactModal
 * Edit an existing marketing contact's fields.
 */

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import marketingService from "../../../api/services/marketing.service";

const FIELDS = [
  { key: "email", label: "Email", type: "email" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip_code", label: "Zip Code" },
  { key: "source", label: "Source" },
  { key: "tags", label: "Tags" },
  { key: "children_count", label: "Children Count", type: "number" },
];

export default function EditContactModal({ contact, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      const initial = {};
      FIELDS.forEach((f) => {
        initial[f.key] = contact[f.key] ?? "";
      });
      setForm(initial);
    }
  }, [contact]);

  if (!contact) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.children_count !== "")
        payload.children_count = Number(payload.children_count);
      await marketingService.updateContact(contact.id, payload);
      toast.success("Contact updated");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold font-kollektif text-text-primary">
            Edit Contact
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.key === "address" ? "col-span-2" : ""}>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                {f.label}
              </label>
              <input
                type={f.type || "text"}
                value={form[f.key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-btn-gold"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-semibold text-heading-dark bg-btn-gold rounded-lg hover:bg-[#e5ad35] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
