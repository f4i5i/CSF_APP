/**
 * Marketing Contacts
 * Browse / filter / edit / delete imported contacts, import new ones, save the
 * current filter as a segment, and jump to Compose to email the audience.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Send, Save, Trash2, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../../../components/Header";
import DataTable from "../../../components/admin/DataTable";
import FilterBuilder from "../../../components/admin/marketing/FilterBuilder";
import ImportContactsModal from "../../../components/admin/marketing/ImportContactsModal";
import EditContactModal from "../../../components/admin/marketing/EditContactModal";
import marketingService from "../../../api/services/marketing.service";

const PER_PAGE = 25;

export default function MarketingContacts() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [segmentName, setSegmentName] = useState(null); // null=closed, ""=open

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingService.getRecords({
        filters,
        page,
        per_page: PER_PAGE,
      });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error("Failed to load contacts");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset to page 1 whenever the filter set changes.
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [filters]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = data.map((c) => c.id);
    const allSelected = pageIds.every((id) => selected.includes(id));
    setSelected(allSelected ? [] : pageIds);
  };

  const handleDelete = async (id) => {
    try {
      await marketingService.deleteContact(id);
      toast.success("Contact deleted");
      fetchRecords();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected contact(s)?`)) return;
    try {
      const res = await marketingService.bulkDelete({ ids: selected });
      toast.success(`Deleted ${res.deleted} contact(s)`);
      setSelected([]);
      fetchRecords();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const handleSaveSegment = async () => {
    const name = (segmentName || "").trim();
    if (!name) return;
    const specs = filters.map((chip) => {
      const [field, op, ...rest] = chip.split(":");
      return { field, op, value: rest.join(":") || null };
    });
    try {
      await marketingService.createSegment({ name, filters: specs });
      toast.success("Segment saved");
      setSegmentName(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save segment");
    }
  };

  const emailAudience = () => {
    navigate("/admin/marketing/compose", {
      state: { filters, count: total },
    });
  };

  const columns = [
    {
      key: "select",
      label: "",
      render: (_v, row) => (
        <input
          type="checkbox"
          checked={selected.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="w-4 h-4 accent-btn-gold"
        />
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{v}</span>
          {row.is_unsubscribed && (
            <span className="text-[10px] uppercase tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              Unsubscribed
            </span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (_v, row) =>
        `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—",
    },
    { key: "phone", label: "Phone", render: (v) => v || "—" },
    {
      key: "location",
      label: "Location",
      render: (_v, row) =>
        [row.city, row.state].filter(Boolean).join(", ") || "—",
    },
    { key: "children_count", label: "Children" },
    {
      key: "actions",
      label: "",
      render: (_v, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditContact(row)}
            className="p-1.5 text-gray-500 hover:text-btn-gold"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-kollektif text-text-primary">
              Marketing Contacts
            </h1>
            <p className="text-sm text-gray-500">{total} contacts</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-heading-dark bg-btn-gold rounded-lg hover:bg-[#e5ad35]"
            >
              <Upload className="w-4 h-4" /> Import
            </button>
            <button
              onClick={() => setSegmentName("")}
              disabled={!filters.length}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-text-primary bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save as segment
            </button>
            <button
              onClick={emailAudience}
              disabled={!total}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#173963] rounded-lg hover:bg-[#12305a] disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Email these ({total})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 rounded-2xl p-4">
          <FilterBuilder value={filters} onChange={setFilters} />
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={
                data.length > 0 &&
                data.every((c) => selected.includes(c.id))
              }
              onChange={toggleSelectAllOnPage}
              className="w-4 h-4 accent-btn-gold"
            />
            Select page
          </label>
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" /> Delete selected ({selected.length})
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No contacts match these filters."
          pagination
          itemsPerPage={PER_PAGE}
          currentPage={page}
          totalItems={total}
          onPageChange={setPage}
        />
      </div>

      <ImportContactsModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchRecords}
      />
      <EditContactModal
        contact={editContact}
        onClose={() => setEditContact(null)}
        onSaved={fetchRecords}
      />

      {/* Save-as-segment mini modal */}
      {segmentName !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-kollektif text-text-primary">
                Save Segment
              </h3>
              <button onClick={() => setSegmentName(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveSegment()}
              placeholder="e.g. NC parents, 2+ kids"
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-btn-gold"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSegmentName(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSegment}
                disabled={!segmentName.trim()}
                className="px-4 py-2 text-sm font-semibold text-heading-dark bg-btn-gold rounded-lg hover:bg-[#e5ad35] disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
