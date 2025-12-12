/**
 * Classes Management Page
 * Admin page for managing classes with Stripe payment configuration
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ClassFormModal from "../../components/admin/ClassFormModal";
import classesService from "../../api/services/classes.service";
import toast from "react-hot-toast";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  useEffect(() => {
    fetchClasses();
  }, [currentPage, programFilter, areaFilter, statusFilter, searchQuery]);
  const dummyClasses = [
    {
      id: 1,
      name: "Beginner Basketball",
      program: { name: "Sports Program" },
      schedule: [
        { day_of_week: "Monday", start_time: "4:00 PM", end_time: "5:30 PM" },
        {
          day_of_week: "Wednesday",
          start_time: "4:00 PM",
          end_time: "5:30 PM",
        },
      ],
      capacity: 20,
      current_enrollment: 12,
      min_age: 8,
      max_age: 12,
      is_active: true,
    },
    {
      id: 2,
      name: "Art & Creativity Workshop",
      program: { name: "Arts Program" },
      schedule: [
        { day_of_week: "Friday", start_time: "3:00 PM", end_time: "4:00 PM" },
      ],
      capacity: 15,
      current_enrollment: 10,
      min_age: 6,
      max_age: 10,
      is_active: false,
    },
    {
      id: 3,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 4,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 5,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 6,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 7,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 8,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 9,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 10,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
    {
      id: 11,
      name: "Advanced Coding Class",
      program: { name: "STEM Program" },
      schedule: [
        { day_of_week: "Tuesday", start_time: "5:00 PM", end_time: "6:30 PM" },
      ],
      capacity: 18,
      current_enrollment: 18,
      min_age: 10,
      max_age: 16,
      is_active: true,
    },
  ];

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await classesService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        program_id: programFilter,
        area_id: areaFilter,
        is_active: statusFilter,
        search: searchQuery,
      });

      const apiData = response.data || response;

      // If API returns empty → use dummy data for UI
      if (!apiData || apiData.length === 0) {
        setClasses(dummyClasses);
        setTotalItems(dummyClasses.length);
      } else {
        setClasses(apiData);
        setTotalItems(response.total || apiData.length);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);

      // If API fails → also show dummy data
      setClasses(dummyClasses);
      setTotalItems(dummyClasses.length);

      toast.error("Using dummy data because API failed");
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

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "No schedule";
    return schedule
      .map((s) => {
        const day = s.day_of_week?.substring(0, 3).toUpperCase();
        return `${day} ${s.start_time}-${s.end_time}`;
      })
      .join(", ");
  };

  const columns = [
    {
      key: "name",
      label: "Class Name",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold font-manrope text-text-primary">
            {value}
          </p>
          <p className="text-xs font-manrope text-text-muted">
            {row.program?.name || "No Program"}
          </p>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (value, row) => (
        <div className="text-sm font-manrope text-text-muted flex items-center">
          <Calendar className="inline w-4 h-4 mr-1 text-text-muted" />
          <span> {formatSchedule(row.schedule)}</span>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (value, row) => (
        <div className="text-sm font-manrope text-text-primary">
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
          label: "Edit Class",
          icon: Edit,
          onClick: () => handleEditClass(row),
        },
        {
          label: "Delete Class",
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
        // TODO: Fetch actual programs from API
      ],
    },
    {
      type: "select",
      placeholder: "All Areas",
      value: areaFilter,
      onChange: setAreaFilter,
      options: [
        { value: "", label: "All Areas" },
        // TODO: Fetch actual areas from API
      ],
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
    <div
      className="min-h-screen  py-8 bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]"
      
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-kollektif">
              Classes Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Create and manage classes with Stripe payment options
            </p>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 bg-btn-gold  text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
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
