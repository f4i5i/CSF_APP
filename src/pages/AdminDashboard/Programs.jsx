/**
 * Programs Management Page
 * Admin page for managing sports programs
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ProgramFormModal from "../../components/admin/ProgramFormModal";
import programsService from "../../api/services/programs.service";
import toast from "react-hot-toast";
import Header from "../../components/Header";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const STATUS_COLORS = {
  true: "bg-green-100 text-green-800",
  false: "bg-gray-100 text-gray-800",
};

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  useEffect(() => {
    fetchPrograms();
  }, [statusFilter]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.is_active = statusFilter === "true";

      const response = await programsService.getAll(params);
      const programsList = Array.isArray(response)
        ? response
        : response.items || response.data || [];
      setPrograms(programsList);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      toast.error("Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = () => {
    setModalMode("create");
    setSelectedProgram(null);
    setModalOpen(true);
  };

  const handleEditProgram = (program) => {
    setModalMode("edit");
    setSelectedProgram(program);
    setModalOpen(true);
  };

  const handleDeleteProgram = async (programId) => {
    try {
      await programsService.delete(programId);
      toast.success("Program deleted successfully");
      fetchPrograms();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast.error(error.response?.data?.message || "Failed to delete program");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProgram(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedProgram(null);
    fetchPrograms();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter programs by search query
  const filteredPrograms = programs.filter((program) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      program.name?.toLowerCase().includes(query) ||
      program.description?.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] font-manrope">{value}</p>
          {row.description && (
            <p className="text-xs text-gray-500 font-manrope truncate max-w-xs">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            STATUS_COLORS[value] || "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500 font-manrope">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "right",
      actions: (row) => [
        {
          label: "Edit",
          icon: Edit,
          onClick: () => handleEditProgram(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Program",
              message: `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
              action: () => handleDeleteProgram(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Statuses",
      value: statusFilter,
      onChange: setStatusFilter,
      options: STATUS_OPTIONS,
    },
  ];

  const hasActiveFilters = statusFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-4 justify-between">
          <div>
            <h1 className="lg:text-[46px] text-[20px] md:text-[30px] font-bold text-text-primary font-kollektif">
              Programs Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Create and manage sports programs
            </p>
          </div>

          <button
            onClick={handleCreateProgram}
            className="flex items-center gap-2 font-manrope bg-btn-gold text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Program
          </button>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search programs..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={filteredPrograms}
          loading={loading}
          emptyMessage="No programs found"
        />
      </div>

      <ProgramFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        initialData={selectedProgram}
        onSuccess={handleModalSuccess}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />
    </div>
  );
}
