/**
 * Schools Management Page
 * Admin page for managing schools/locations
 */

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import SchoolFormModal from "../../components/admin/SchoolFormModal";
import schoolsService from "../../api/services/schools.service";
import areasService from "../../api/services/areas.service";
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

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await areasService.getAll();
      const areasList = Array.isArray(response)
        ? response
        : response.items || response.data || [];
      setAreas(areasList);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.is_active = statusFilter === "true";
      if (areaFilter) params.area_id = areaFilter;

      const response = await schoolsService.getAll(params);
      const schoolsList = Array.isArray(response)
        ? response
        : response.items || response.data || [];
      setSchools(schoolsList);
    } catch (error) {
      console.error("Failed to fetch schools:", error);
      toast.error("Failed to load sites");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, areaFilter]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleCreateSchool = () => {
    setModalMode("create");
    setSelectedSchool(null);
    setModalOpen(true);
  };

  const handleEditSchool = (school) => {
    setModalMode("edit");
    setSelectedSchool(school);
    setModalOpen(true);
  };

  const handleDeleteSchool = async (schoolId) => {
    try {
      await schoolsService.delete(schoolId);
      toast.success("Site deleted successfully");
      fetchSchools();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete school:", error);
      toast.error(error.response?.data?.message || "Failed to delete site. It may have associated classes.");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSchool(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedSchool(null);
    fetchSchools();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.id === areaId);
    return area?.name || "Unknown";
  };

  // Filter schools by search query
  const filteredSchools = schools.filter((school) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      school.name?.toLowerCase().includes(query) ||
      school.address?.toLowerCase().includes(query) ||
      school.city?.toLowerCase().includes(query) ||
      school.code?.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Site",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] font-manrope">{value}</p>
          {row.code && (
            <p className="text-xs text-gray-500 font-manrope">Code: {row.code}</p>
          )}
        </div>
      ),
    },
    {
      key: "address",
      label: "Location",
      render: (value, row) => (
        <div className="flex items-start gap-1">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 font-manrope">{value}</p>
            <p className="text-xs text-gray-500 font-manrope">
              {row.city}, {row.state} {row.zip_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "area_id",
      label: "Area",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700 font-manrope">
          {getAreaName(value)}
        </span>
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
          onClick: () => handleEditSchool(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Site",
              message: `Are you sure you want to delete "${row.name}"? This will fail if the site has associated classes.`,
              action: () => handleDeleteSchool(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Areas",
      value: areaFilter,
      onChange: setAreaFilter,
      options: [
        { value: "", label: "All Areas" },
        ...areas.map((a) => ({ value: a.id, label: a.name })),
      ],
    },
    {
      type: "select",
      placeholder: "All Statuses",
      value: statusFilter,
      onChange: setStatusFilter,
      options: STATUS_OPTIONS,
    },
  ];

  const hasActiveFilters = statusFilter || areaFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setAreaFilter("");
  };

  return (
    <div className="h-full">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-4 justify-between">
          <div>
            <h1 className="lg:text-[46px] text-[20px] md:text-[30px] font-bold text-text-primary font-kollektif">
              Sites Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Create and manage site locations
            </p>
          </div>

          <button
            onClick={handleCreateSchool}
            className="flex items-center gap-2 font-manrope bg-btn-gold text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Site
          </button>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search sites..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={filteredSchools}
          loading={loading}
          emptyMessage="No sites found"
        />
      </div>

      <SchoolFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        initialData={selectedSchool}
        onSuccess={handleModalSuccess}
        areas={areas}
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
