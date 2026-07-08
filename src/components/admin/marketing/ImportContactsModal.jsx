/**
 * ImportContactsModal
 * Upload a CSV/XLSX file of marketing contacts and show the import result
 * (inserted / skipped + a preview of rejected rows).
 */

import React, { useState } from "react";
import { X, UploadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import marketingService from "../../../api/services/marketing.service";

export default function ImportContactsModal({ isOpen, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const reset = () => {
    setFile(null);
    setResult(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (f) => {
    if (!f) return;
    const ok = /\.(csv|xlsx)$/i.test(f.name);
    if (!ok) {
      toast.error("Please choose a .csv or .xlsx file");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      const res = await marketingService.upload(file);
      setResult(res);
      toast.success(`Imported ${res.inserted} contact(s)`);
      onImported?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Import failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold font-kollektif text-text-primary">
            Import Contacts
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
          <label
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-btn-gold transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <UploadCloud className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Drag a .csv or .xlsx here, or click to choose
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {file && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileSpreadsheet className="w-4 h-4 text-btn-gold" />
              {file.name}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Recognized columns: Email (required), First Name, Last Name, Phone,
            Address, City, State, Zip Code, Children Count, Source, Tags, Signup
            Date. Duplicate emails are skipped.
          </p>

          {result && (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex gap-4 text-sm">
                <span className="text-green-700 font-semibold">
                  {result.inserted} inserted
                </span>
                <span className="text-amber-700 font-semibold">
                  {result.skipped} skipped
                </span>
              </div>
              {result.errors?.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-1 text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5" /> Rejected rows:
                  </div>
                  {result.errors.slice(0, 20).map((e, i) => (
                    <div key={i}>
                      Row {e.row}: {e.reason}
                    </div>
                  ))}
                  {result.errors.length > 20 && (
                    <div>…and {result.errors.length - 20} more</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {result ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || submitting}
            className="px-6 py-2 text-sm font-semibold text-heading-dark bg-btn-gold rounded-lg hover:bg-[#e5ad35] disabled:opacity-50"
          >
            {submitting ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
