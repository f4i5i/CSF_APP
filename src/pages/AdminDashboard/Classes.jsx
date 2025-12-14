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
import Header from "@/components/Header";
import GenericButton from "@/components/GenericButton";

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
    name: "Math 101",
    program: { name: "Mathematics" },
    schedule: [
      { day_of_week: "Monday", start_time: "10:00", end_time: "12:00" },
      { day_of_week: "Wednesday", start_time: "10:00", end_time: "12:00" },
    ],
    capacity: 20,
    current_enrollment: 10,
    min_age: 8,
    max_age: 10,
    is_active: true,
  },
  {
    id: 2,
    name: "Science Club",
    program: { name: "Science" },
    schedule: [{ day_of_week: "Friday", start_time: "14:00", end_time: "16:00" }],
    capacity: 15,
    current_enrollment: 8,
    min_age: 9,
    max_age: 12,
    is_active: false,
  },
  {
    id: 3,
    name: "English Literature",
    program: { name: "Language Arts" },
    schedule: [{ day_of_week: "Tuesday", start_time: "09:00", end_time: "11:00" }],
    capacity: 25,
    current_enrollment: 20,
    min_age: 10,
    max_age: 13,
    is_active: true,
  },
  {
    id: 4,
    name: "History 101",
    program: { name: "Social Studies" },
    schedule: [
      { day_of_week: "Monday", start_time: "13:00", end_time: "15:00" },
      { day_of_week: "Thursday", start_time: "13:00", end_time: "15:00" },
    ],
    capacity: 30,
    current_enrollment: 25,
    min_age: 11,
    max_age: 14,
    is_active: true,
  },
  {
    id: 5,
    name: "Art Workshop",
    program: { name: "Arts" },
    schedule: [{ day_of_week: "Wednesday", start_time: "10:00", end_time: "12:00" }],
    capacity: 12,
    current_enrollment: 10,
    min_age: 8,
    max_age: 12,
    is_active: true,
  },
  {
    id: 6,
    name: "Music Class",
    program: { name: "Arts" },
    schedule: [{ day_of_week: "Friday", start_time: "09:00", end_time: "11:00" }],
    capacity: 15,
    current_enrollment: 12,
    min_age: 7,
    max_age: 10,
    is_active: true,
  },
  {
    id: 7,
    name: "Physics Lab",
    program: { name: "Science" },
    schedule: [{ day_of_week: "Tuesday", start_time: "14:00", end_time: "16:00" }],
    capacity: 20,
    current_enrollment: 18,
    min_age: 12,
    max_age: 15,
    is_active: true,
  },
  {
    id: 8,
    name: "Chemistry Basics",
    program: { name: "Science" },
    schedule: [
      { day_of_week: "Monday", start_time: "10:00", end_time: "12:00" },
      { day_of_week: "Wednesday", start_time: "10:00", end_time: "12:00" },
    ],
    capacity: 20,
    current_enrollment: 15,
    min_age: 12,
    max_age: 15,
    is_active: false,
  },
  {
    id: 9,
    name: "Computer Basics",
    program: { name: "Technology" },
    schedule: [{ day_of_week: "Thursday", start_time: "09:00", end_time: "11:00" }],
    capacity: 18,
    current_enrollment: 16,
    min_age: 9,
    max_age: 13,
    is_active: true,
  },
  {
    id: 10,
    name: "Robotics Club",
    program: { name: "Technology" },
    schedule: [{ day_of_week: "Friday", start_time: "13:00", end_time: "15:00" }],
    capacity: 10,
    current_enrollment: 8,
    min_age: 11,
    max_age: 15,
    is_active: false,
  },
  {
    id: 11,
    name: "Physical Education",
    program: { name: "Sports" },
    schedule: [
      { day_of_week: "Monday", start_time: "08:00", end_time: "09:30" },
      { day_of_week: "Wednesday", start_time: "08:00", end_time: "09:30" },
    ],
    capacity: 25,
    current_enrollment: 20,
    min_age: 7,
    max_age: 12,
    is_active: true,
  },
  {
    id: 12,
    name: "Drama Club",
    program: { name: "Arts" },
    schedule: [{ day_of_week: "Tuesday", start_time: "15:00", end_time: "17:00" }],
    capacity: 15,
    current_enrollment: 12,
    min_age: 9,
    max_age: 14,
    is_active: true,
  },
  {
    id: 13,
    name: "French Language",
    program: { name: "Language Arts" },
    schedule: [{ day_of_week: "Thursday", start_time: "11:00", end_time: "13:00" }],
    capacity: 20,
    current_enrollment: 18,
    min_age: 10,
    max_age: 14,
    is_active: false,
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

    let classesData = [];
    let total = 0;

    if (Array.isArray(response)) {
      classesData = response;
      total = response.length;
    } else if (response && Array.isArray(response.data)) {
      classesData = response.data;
      total = response.total || response.data.length;
    } else if (response && response.data) {
      classesData = Array.isArray(response.data.items) ? response.data.items : [];
      total = response.data.total || response.total || classesData.length;
    }

    // If no data returned from API, use dummy data
    if (!classesData || classesData.length === 0) {
      classesData = dummyClasses;
      total = dummyClasses.length;
    }

    setClasses(classesData);
    setTotalItems(total);
  } catch (error) {
    console.error("Failed to fetch classes, using dummy data:", error);
    toast.error("Failed to load classes, showing dummy data");
    setClasses(dummyClasses);
    setTotalItems(dummyClasses.length);
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
        <div className="text-sm font-manrope text-text-primary">flex items-center justify-end gap-2
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
          label: "Edit ",
          icon: Edit,
          onClick: () => handleEditClass(row),
        },
        {
          label: "Delete ",
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
    <div className="min-h-screen  bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col  lg:items-center items-start lg:gap-0 gap-4  justify-between">
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
