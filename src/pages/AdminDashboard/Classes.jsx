/**
 * Classes Management Page
 * Admin page for managing classes with Stripe payment configuration
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Copy } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ClassFormModal from "../../components/admin/ClassFormModal";
import classesService from "../../api/services/classes.service";
import programsService from "../../api/services/programs.service";
import areasService from "../../api/services/areas.service";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import GenericButton from "../../components/GenericButton";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filter options from API
  const [programs, setPrograms] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedClass, setSelectedClass] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch classes when filters change
  useEffect(() => {
    fetchClasses();
  }, [currentPage, programFilter, areaFilter, statusFilter, searchQuery]);

  const fetchFilterOptions = async () => {
    setFiltersLoading(true);
    try {
      const [programsData, areasData] = await Promise.all([
        programsService.getAll(),
        areasService.getAll(),
      ]);

      // Handle different response structures
      const programsList = Array.isArray(programsData)
        ? programsData
        : (programsData.items || programsData.data || []);

      const areasList = Array.isArray(areasData)
        ? areasData
        : (areasData.items || areasData.data || []);

      setPrograms(programsList);
      setAreas(areasList);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      toast.error('Failed to load filter options');
      setPrograms([]);
      setAreas([]);
    } finally {
      setFiltersLoading(false);
    }
  };


  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Calculate skip for pagination (backend uses skip/limit, not page)
      const skip = (currentPage - 1) * itemsPerPage;

      // Build filter params (only include non-empty values)
      const params = {
        skip,
        limit: itemsPerPage,
      };

      if (programFilter) params.program_id = programFilter;
      if (areaFilter) params.area_id = areaFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await classesService.getAll(params);

      // Backend returns: { items: [], total: number, skip: number, limit: number }
      let classesData = response.items || [];
      let total = response.total || 0;

      // Filter by active status on frontend if needed
      if (statusFilter !== "") {
        const isActive = statusFilter === "true";
        classesData = classesData.filter((c) => c.is_active === isActive);
      }

      setClasses(classesData);
      setTotalItems(total);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateClass = () => {
    setModalMode("create");
    setSelectedClass(null);
    setModalOpen(true);
  };

  const handleEditClass = (classData) => {
    setModalMode("edit");
    setSelectedClass(classData);
    setModalOpen(true);
  };

  const handleCloneClass = (classData) => {
    // Create a copy of the class data without the ID
    const clonedData = {
      ...classData,
      id: undefined, // Remove ID so it creates a new class
      name: `${classData.name} (Copy)`, // Add "(Copy)" to the name
      // Reset enrollment count for the new class
      current_enrollment: 0,
      // Keep the same schedule, dates, capacity, etc.
    };

    setModalMode("create"); // Use create mode since it's a new class
    setSelectedClass(clonedData);
    setModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    try {
      await classesService.delete(classId);
      toast.success("Class deleted successfully");
      fetchClasses();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error("Failed to delete class");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClass(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedClass(null);
    fetchClasses();
  };

  const formatSchedule = (classData) => {
    // Handle backend format: {weekdays: [...], start_time, end_time}
    if (classData.weekdays && classData.weekdays.length > 0) {
      const days = classData.weekdays.map(d => d.substring(0, 3).toUpperCase()).join(", ");
      return `${days} ${classData.start_time || ''}-${classData.end_time || ''}`;
    }

    // Handle frontend/array format: [{day_of_week, start_time, end_time}]
    if (classData.schedule && Array.isArray(classData.schedule) && classData.schedule.length > 0) {
      return classData.schedule
        .map((s) => {
          const day = s.day_of_week?.substring(0, 3).toUpperCase();
          return `${day} ${s.start_time}-${s.end_time}`;
        })
        .join(", ");
    }

    return "No schedule";
  };

  const columns = [
    {
      key: "name",
      label: "Class Name",
      sortable: true,
      render: (value, row) => {
        const programName = row.program?.name || row.program_name;
        const areaName = row.area?.name || row.area_name;

        // Build subtitle parts
        const parts = [];
        if (programName) parts.push(programName);
        if (areaName) parts.push(areaName);
        const subtitle = parts.length > 0 ? parts.join(" • ") : null;

        return (
          <div>
            <p className="font-semibold font-manrope text-text-primary">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs font-manrope text-text-muted">
                {subtitle}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "school",
      label: "School/Code",
      render: (value, row) => {
        const schoolName = row.school?.name || row.school_name;
        const schoolCode = row.school_code || row.school?.code;

        return (
          <div className="text-sm font-manrope">
            <p className="text-text-primary">{schoolName || "—"}</p>
            {schoolCode && (
              <p className="text-xs text-text-muted font-mono">{schoolCode}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (value, row) => (
        <div className="text-sm font-manrope text-text-muted flex items-center">
          <Calendar className="inline w-4 h-4 mr-1 text-text-muted" />
          <span>{formatSchedule(row)}</span>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Start - End Date",
      render: (value, row) => (
        <div className="text-xs font-manrope text-text-muted">
          <p>{row.start_date ? new Date(row.start_date).toLocaleDateString() : "N/A"}</p>
          <p>{row.end_date ? new Date(row.end_date).toLocaleDateString() : "N/A"}</p>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (value, row) => (
        <div className="text-sm font-manrope text-text-primary flex items-center gap-2">
          <span className="font-semibold text-text-primary">
            {row.current_enrollment || 0}
          </span>
          <span className="text-text-muted"> / {value}</span>
        </div>
      ),
    },
    {
      key: "age_range",
      label: "Age Range",
      render: (value, row) => (
        <span className="text-sm font-manrope text-text-muted">
          {row.min_age || 0} - {row.max_age || 18} yrs
        </span>
      ),
    },
    {
      key: "class_type",
      label: "Type",
      render: (value) => (
        <span className="text-xs font-manrope px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {value === "one-time" ? "One-time" : value === "membership" ? "Membership" : "N/A"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      type: "status",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value
              ? "bg-[#DFF5E8] text-status-success"
              : "bg-neutral-lightest text-neutral-dark"
          }`}
        >
          {value ? "Active" : "Inactive"}
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
          onClick: () => handleEditClass(row),
        },
        {
          label: "Clone",
          icon: Copy,
          onClick: () => handleCloneClass(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Class",
              message: `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
              action: () => handleDeleteClass(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Programs",
      value: programFilter,
      onChange: setProgramFilter,
      options: [
        { value: "", label: "All Programs" },
        ...programs.map((program) => ({
          value: program.id,
          label: program.name,
        })),
      ],
      disabled: filtersLoading,
    },
    {
      type: "select",
      placeholder: "All Areas",
      value: areaFilter,
      onChange: setAreaFilter,
      options: [
        { value: "", label: "All Areas" },
        ...areas.map((area) => ({
          value: area.id,
          label: area.name,
        })),
      ],
      disabled: filtersLoading,
    },
    {
      type: "select",
      placeholder: "All Statuses",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "", label: "All Statuses" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const hasActiveFilters =
    programFilter || areaFilter || statusFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setProgramFilter("");
    setAreaFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="h-full">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col  lg:items-center items-start lg:gap-0 gap-4  justify-between">
          <div>
            <h1 className="lg:text-[46px] text-[20px] md:text-[30px] font-bold text-text-primary font-kollektif">
              Classes Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Create and manage classes with Stripe payment options
            </p>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 font-manrope bg-btn-gold  text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Class
          </button>
        </div>
        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by class name or description..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
        <DataTable
          columns={columns}
          data={classes}
          loading={loading}
          emptyMessage="No classes found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <ClassFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        initialData={selectedClass}
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