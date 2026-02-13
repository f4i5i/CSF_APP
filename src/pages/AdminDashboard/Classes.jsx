/**
 * Classes Management Page
 * Admin page for managing classes with Stripe payment configuration
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, Copy, Users, X, Link, Loader2, User, Mail, Phone, CheckCircle, ExternalLink, AlertTriangle, ArrowRight, Eye, MapPin, Clock, DollarSign, Tag } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ClassFormModal from "../../components/admin/ClassFormModal";
import classesService from "../../api/services/classes.service";
import programsService from "../../api/services/programs.service";
import areasService from "../../api/services/areas.service";
import adminService from "../../api/services/admin.service";
import enrollmentsService from "../../api/services/enrollments.service";
import toast from "react-hot-toast";
import Header from "../../components/Header";

export default function Classes() {
  const navigate = useNavigate();
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
  const itemsPerPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedClass, setSelectedClass] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  // Roster modal state
  const [rosterModal, setRosterModal] = useState({
    isOpen: false,
    classData: null,
    roster: [],
    loading: false,
    shareLink: "",
    linkCopied: false,
  });

  // View class detail modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    classData: null,
  });

  // Delete with enrollments modal state
  const [deleteEnrollmentsModal, setDeleteEnrollmentsModal] = useState({
    isOpen: false,
    classToDelete: null,
    activeEnrollments: [],
    loading: false,
    processing: false,
    selectedAction: null, // 'move' | 'cancel'
    targetClassId: '',
  });

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

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

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate skip for pagination (backend uses skip/limit, not page)
      const skip = (currentPage - 1) * itemsPerPage;

      // Build filter params (only include non-empty values)
      const params = {
        skip,
        limit: itemsPerPage,
        include_inactive: true,  // Admin needs to see draft/inactive classes
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
  }, [currentPage, programFilter, areaFilter, statusFilter, searchQuery]);

  // Fetch classes when filters change
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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

  // Check for active enrollments before deleting
  const handleDeleteClick = async (classData) => {
    setDeleteEnrollmentsModal({
      isOpen: true,
      classToDelete: classData,
      activeEnrollments: [],
      loading: true,
      processing: false,
      selectedAction: null,
      targetClassId: '',
    });

    try {
      // Fetch active enrollments for this class
      const response = await enrollmentsService.getByClass(classData.id, { status: 'active' });
      const enrollments = Array.isArray(response) ? response : (response?.items || response?.enrollments || []);

      if (enrollments.length === 0) {
        // No active enrollments, proceed with simple delete confirmation
        setDeleteEnrollmentsModal(prev => ({ ...prev, isOpen: false }));
        setConfirmDialog({
          isOpen: true,
          title: "Delete Class",
          message: `Are you sure you want to delete "${classData.name}"? This action cannot be undone.`,
          action: () => executeDeleteClass(classData.id),
        });
      } else {
        // Has active enrollments, show options modal
        setDeleteEnrollmentsModal(prev => ({
          ...prev,
          activeEnrollments: enrollments,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to check enrollments:", error);
      // If we can't check, show the modal anyway with a warning
      setDeleteEnrollmentsModal(prev => ({
        ...prev,
        loading: false,
        activeEnrollments: [],
      }));
    }
  };

  // Execute the actual class deletion
  const executeDeleteClass = async (classId) => {
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

  // Handle moving enrollments to another class
  const handleMoveEnrollments = async () => {
    const { classToDelete, activeEnrollments, targetClassId } = deleteEnrollmentsModal;

    if (!targetClassId) {
      toast.error("Please select a target class");
      return;
    }

    setDeleteEnrollmentsModal(prev => ({ ...prev, processing: true }));

    try {
      // Move each enrollment to the target class
      for (const enrollment of activeEnrollments) {
        await enrollmentsService.transfer(enrollment.id, targetClassId);
      }

      toast.success(`${activeEnrollments.length} enrollment(s) moved successfully`);

      // Now delete the class
      await classesService.delete(classToDelete.id);
      toast.success("Class deleted successfully");

      closeDeleteEnrollmentsModal();
      fetchClasses();
    } catch (error) {
      console.error("Failed to move enrollments:", error);
      toast.error("Failed to move enrollments. Please try again.");
      setDeleteEnrollmentsModal(prev => ({ ...prev, processing: false }));
    }
  };

  // Handle canceling all enrollments
  const handleCancelEnrollments = async () => {
    const { classToDelete, activeEnrollments } = deleteEnrollmentsModal;

    setDeleteEnrollmentsModal(prev => ({ ...prev, processing: true }));

    try {
      // Cancel each enrollment
      for (const enrollment of activeEnrollments) {
        await enrollmentsService.cancel(enrollment.id);
      }

      toast.success(`${activeEnrollments.length} enrollment(s) cancelled`);

      // Now delete the class
      await classesService.delete(classToDelete.id);
      toast.success("Class deleted successfully");

      closeDeleteEnrollmentsModal();
      fetchClasses();
    } catch (error) {
      console.error("Failed to cancel enrollments:", error);
      toast.error("Failed to cancel enrollments. Please try again.");
      setDeleteEnrollmentsModal(prev => ({ ...prev, processing: false }));
    }
  };

  // Close delete enrollments modal
  const closeDeleteEnrollmentsModal = () => {
    setDeleteEnrollmentsModal({
      isOpen: false,
      classToDelete: null,
      activeEnrollments: [],
      loading: false,
      processing: false,
      selectedAction: null,
      targetClassId: '',
    });
  };

  // Get available target classes (exclude the one being deleted)
  const getAvailableTargetClasses = () => {
    return classes.filter(c =>
      c.id !== deleteEnrollmentsModal.classToDelete?.id &&
      c.is_active
    );
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

  // Handle opening roster modal
  const handleViewRoster = async (classData) => {
    setRosterModal({
      isOpen: true,
      classData,
      roster: [],
      loading: true,
      shareLink: "",
      linkCopied: false,
    });

    try {
      const roster = await adminService.getClassRoster(classData.id);
      // Generate a shareable link (public roster view URL)
      const shareLink = `${window.location.origin}/roster/${classData.id}`;

      setRosterModal(prev => ({
        ...prev,
        roster: roster.students || roster.enrollments || roster || [],
        loading: false,
        shareLink,
      }));
    } catch (error) {
      console.error("Failed to fetch roster:", error);
      toast.error("Failed to load class roster");
      setRosterModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle viewing class details in modal
  const handleViewClass = (classData) => {
    setViewModal({ isOpen: true, classData });
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, classData: null });
  };

  // Close roster modal
  const closeRosterModal = () => {
    setRosterModal({
      isOpen: false,
      classData: null,
      roster: [],
      loading: false,
      shareLink: "",
      linkCopied: false,
    });
  };

  // Copy roster share link to clipboard
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(rosterModal.shareLink);
      setRosterModal(prev => ({ ...prev, linkCopied: true }));
      toast.success("Roster link copied to clipboard!");

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setRosterModal(prev => ({ ...prev, linkCopied: false }));
      }, 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
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
          <div className="min-w-[140px] max-w-[200px]">
            <p className="font-semibold font-manrope text-text-primary text-xs sm:text-sm truncate" title={value}>
              {value}
            </p>
            {subtitle && (
              <p className="text-[10px] sm:text-xs font-manrope text-text-muted truncate" title={subtitle}>
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
      hideOnMobile: true,
      render: (value, row) => {
        const schoolName = row.school?.name || row.school_name;
        const schoolCode = row.school_code || row.school?.code;

        return (
          <div className="text-sm font-manrope min-w-[80px] max-w-[120px]">
            <p className="text-text-primary truncate" title={schoolName}>{schoolName || "—"}</p>
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
      hideOnMobile: true,
      render: (value, row) => (
        <div className="text-xs font-manrope text-text-muted min-w-[120px] max-w-[180px]">
          <div className="flex items-start gap-1">
            <Calendar className="w-3.5 h-3.5 mt-0.5 text-text-muted flex-shrink-0" />
            <span className="whitespace-normal break-words leading-tight">{formatSchedule(row)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Dates",
      hideOnMobile: true,
      render: (value, row) => (
        <div className="text-xs font-manrope text-text-muted whitespace-nowrap">
          <p>{row.start_date ? new Date(row.start_date).toLocaleDateString() : "N/A"}</p>
          <p>{row.end_date ? new Date(row.end_date).toLocaleDateString() : "N/A"}</p>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (value, row) => (
        <div className="text-xs sm:text-sm font-manrope text-text-primary whitespace-nowrap">
          <span className="font-semibold text-text-primary">
            {row.current_enrollment || 0}
          </span>
          <span className="text-text-muted"> / {value}</span>
        </div>
      ),
    },
    {
      key: "age_range",
      label: "Age",
      hideOnMobile: true,
      render: (value, row) => (
        <span className="text-xs font-manrope text-text-muted whitespace-nowrap">
          {row.min_age || 0} - {row.max_age || 18} yrs
        </span>
      ),
    },
    {
      key: "class_type",
      label: "Type",
      hideOnMobile: true,
      render: (value) => (
        <span className="text-xs font-manrope px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
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
          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
            value
              ? "bg-[#DFF5E8] text-status-success"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {value ? "Active" : "Draft"}
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
          label: "View",
          icon: Eye,
          onClick: () => handleViewClass(row),
        },
        {
          label: "Roster",
          icon: Users,
          onClick: () => handleViewRoster(row),
        },
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
          onClick: () => handleDeleteClick(row),
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
        { value: "false", label: "Draft" },
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate">
              Classes Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Create and manage classes with Stripe payment options
            </p>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex items-center gap-1.5 sm:gap-2 font-manrope bg-btn-gold text-text-body px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Create </span>Class
          </button>
        </div>
        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by class name or description..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>
        <div className="flex-1 min-h-0 flex flex-col pb-2">
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

      {/* Delete with Enrollments Modal */}
      {deleteEnrollmentsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b bg-red-50">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-heading-dark font-manrope">
                  Delete Class
                </h3>
                <p className="text-xs sm:text-sm text-text-muted font-manrope truncate">
                  {deleteEnrollmentsModal.classToDelete?.name}
                </p>
              </div>
              <button
                onClick={closeDeleteEnrollmentsModal}
                disabled={deleteEnrollmentsModal.processing}
                className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4">
              {deleteEnrollmentsModal.loading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-btn-gold mr-2" />
                  <span className="text-text-muted font-manrope text-sm sm:text-base">Checking enrollments...</span>
                </div>
              ) : deleteEnrollmentsModal.activeEnrollments.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Warning Message */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-yellow-800 font-manrope">
                      <strong>Warning:</strong> This class has{" "}
                      <span className="font-bold">{deleteEnrollmentsModal.activeEnrollments.length}</span>{" "}
                      active enrollment{deleteEnrollmentsModal.activeEnrollments.length !== 1 ? 's' : ''}.
                      Please choose how to handle them before deleting.
                    </p>
                  </div>

                  {/* Enrolled Students List */}
                  <div className="max-h-28 sm:max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2">Active Enrollments:</p>
                    <div className="space-y-1">
                      {deleteEnrollmentsModal.activeEnrollments.slice(0, 5).map((enrollment, idx) => {
                        const child = enrollment.child || enrollment;
                        return (
                          <div key={enrollment.id || idx} className="flex items-center gap-2 text-xs sm:text-sm">
                            <User className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-gray-700 truncate">
                              {child.first_name} {child.last_name}
                            </span>
                          </div>
                        );
                      })}
                      {deleteEnrollmentsModal.activeEnrollments.length > 5 && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          +{deleteEnrollmentsModal.activeEnrollments.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Options */}
                  <div className="space-y-2 sm:space-y-3">
                    {/* Option 1: Move to another class */}
                    <div
                      className={`border rounded-lg p-2 sm:p-3 cursor-pointer transition-colors ${
                        deleteEnrollmentsModal.selectedAction === 'move'
                          ? 'border-btn-gold bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDeleteEnrollmentsModal(prev => ({ ...prev, selectedAction: 'move' }))}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="radio"
                          checked={deleteEnrollmentsModal.selectedAction === 'move'}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-btn-gold shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            Move to Another Class
                          </p>
                          <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 sm:mt-1">
                            Transfer all enrollments to a different class
                          </p>
                        </div>
                      </div>

                      {/* Target Class Selector */}
                      {deleteEnrollmentsModal.selectedAction === 'move' && (
                        <div className="mt-2 sm:mt-3 pl-5 sm:pl-7">
                          <select
                            value={deleteEnrollmentsModal.targetClassId}
                            onChange={(e) => setDeleteEnrollmentsModal(prev => ({
                              ...prev,
                              targetClassId: e.target.value
                            }))}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-manrope focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
                          >
                            <option value="">Select target class...</option>
                            {getAvailableTargetClasses().map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.current_enrollment || 0}/{c.capacity} enrolled)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Cancel all enrollments */}
                    <div
                      className={`border rounded-lg p-2 sm:p-3 cursor-pointer transition-colors ${
                        deleteEnrollmentsModal.selectedAction === 'cancel'
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDeleteEnrollmentsModal(prev => ({ ...prev, selectedAction: 'cancel' }))}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="radio"
                          checked={deleteEnrollmentsModal.selectedAction === 'cancel'}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                            <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                            Cancel All Enrollments
                          </p>
                          <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 sm:mt-1">
                            Cancel all active enrollments and delete the class
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-text-muted font-manrope text-sm sm:text-base">
                    No active enrollments found. You can safely delete this class.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t bg-gray-50">
              <button
                onClick={closeDeleteEnrollmentsModal}
                disabled={deleteEnrollmentsModal.processing}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-manrope disabled:opacity-50"
              >
                Cancel
              </button>

              {deleteEnrollmentsModal.activeEnrollments.length > 0 ? (
                <button
                  onClick={deleteEnrollmentsModal.selectedAction === 'move' ? handleMoveEnrollments : handleCancelEnrollments}
                  disabled={
                    deleteEnrollmentsModal.processing ||
                    !deleteEnrollmentsModal.selectedAction ||
                    (deleteEnrollmentsModal.selectedAction === 'move' && !deleteEnrollmentsModal.targetClassId)
                  }
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-manrope disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteEnrollmentsModal.processing ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      {deleteEnrollmentsModal.selectedAction === 'move' ? 'Move & Delete' : 'Cancel & Delete'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    closeDeleteEnrollmentsModal();
                    executeDeleteClass(deleteEnrollmentsModal.classToDelete.id);
                  }}
                  disabled={deleteEnrollmentsModal.processing}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-manrope"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Delete Class
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Roster Modal */}
      {rosterModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-btn-gold shrink-0" />
                  Class Roster
                </h3>
                {rosterModal.classData && (
                  <p className="text-xs sm:text-sm text-text-muted font-manrope mt-1 truncate">
                    {rosterModal.classData.name}
                  </p>
                )}
              </div>
              <button
                onClick={closeRosterModal}
                className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            {/* Share Link Section */}
            {rosterModal.shareLink && (
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border-b border-blue-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                    <Link className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800 font-manrope">Share:</span>
                    <span className="text-xs sm:text-sm text-blue-600 truncate font-mono">{rosterModal.shareLink}</span>
                  </div>
                  <button
                    onClick={copyShareLink}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 w-full sm:w-auto ${
                      rosterModal.linkCopied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {rosterModal.linkCopied ? (
                      <>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {rosterModal.loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-btn-gold mr-2 sm:mr-3" />
                  <span className="text-text-muted font-manrope text-sm sm:text-base">Loading roster...</span>
                </div>
              ) : rosterModal.roster.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-text-muted font-manrope text-sm sm:text-base">No students enrolled in this class</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-text-primary font-manrope">
                      {rosterModal.roster.length} Student{rosterModal.roster.length !== 1 ? 's' : ''} Enrolled
                    </p>
                  </div>

                  <div className="grid gap-2 sm:gap-3">
                    {rosterModal.roster.map((student, idx) => {
                      // Handle both flat (backend) and nested response structures
                      const childName = student.child_name || `${student.child?.first_name || student.first_name || ''} ${student.child?.last_name || student.last_name || ''}`.trim();
                      const childAge = student.child_age ?? student.child?.age;
                      const childDob = student.child_dob || student.child?.date_of_birth;
                      const childGrade = student.child?.grade || student.grade;
                      const parentName = student.parent_name || `${student.parent?.first_name || ''} ${student.parent?.last_name || ''}`.trim() || student.parent?.full_name;
                      const parentEmail = student.parent_email || student.parent?.email;
                      const parentPhone = student.parent_phone || student.parent?.phone;
                      const enrollmentStatus = student.enrollment_status || student.enrollment?.status || student.status;
                      const studentId = student.child_id || student.child?.id || student.enrollment_id || idx;

                      return (
                        <div
                          key={studentId}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start gap-2 sm:gap-4">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-btn-gold/20 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 sm:w-6 sm:h-6 text-btn-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-text-primary font-manrope text-sm sm:text-base truncate">
                                    {childName || 'Unknown Student'}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-text-muted font-manrope">
                                    {(childAge != null || childDob) && (
                                      <span>Age: {childAge ?? (new Date().getFullYear() - new Date(childDob).getFullYear())}</span>
                                    )}
                                    {childGrade && <span>Grade {childGrade}</span>}
                                  </div>
                                </div>
                                {enrollmentStatus && (
                                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium shrink-0 ${
                                    enrollmentStatus === 'ACTIVE' || enrollmentStatus === 'active'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {enrollmentStatus}
                                  </span>
                                )}
                              </div>

                              {/* Parent Info */}
                              {(parentName || parentEmail || parentPhone) && (
                                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                                  <p className="text-[10px] sm:text-xs font-medium text-text-muted mb-1 font-manrope">Parent/Guardian</p>
                                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-text-primary font-manrope">
                                    {parentName && <span className="font-medium">{parentName}</span>}
                                    {parentEmail && (
                                      <span className="flex items-center gap-1 text-text-muted truncate">
                                        <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span className="truncate">{parentEmail}</span>
                                      </span>
                                    )}
                                    {parentPhone && (
                                      <span className="flex items-center gap-1 text-text-muted">
                                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        {parentPhone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t bg-gray-50">
              <button
                onClick={closeRosterModal}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-manrope"
              >
                Close
              </button>
              {rosterModal.shareLink && (
                <a
                  href={rosterModal.shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-btn-gold rounded-lg hover:bg-btn-gold/90 transition-colors font-manrope"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  Open Roster Page
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {/* View Class Detail Modal */}
      {viewModal.isOpen && viewModal.classData && (() => {
        const cls = viewModal.classData;
        const image = cls.cover_photo_url || cls.image_url;
        const programName = cls.program?.name || cls.program_name;
        const areaName = cls.area?.name || cls.area_name;
        const schoolName = cls.school?.name || cls.school_name;
        const schoolCode = cls.school_code || cls.school?.code;
        const coaches = cls.coaches || cls.instructors || [];
        const priceDisplay = cls.price_display || cls.price_text || (cls.base_price ? `$${cls.base_price}` : 'Contact for pricing');
        const classType = cls.class_type === 'one-time' ? 'One-time' : cls.class_type === 'membership' ? 'Membership' : cls.class_type || 'N/A';
        const registrationLink = `${window.location.origin}/checkout?classId=${cls.id}`;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-btn-gold shrink-0" />
                    Class Details
                  </h3>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {/* Image + Title Section */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {image ? (
                    <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={image} alt={cls.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-heading-dark font-manrope truncate">{cls.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {programName && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{programName}</span>
                      )}
                      {areaName && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{areaName}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls.is_active ? 'bg-[#DFF5E8] text-status-success' : 'bg-amber-100 text-amber-700'}`}>
                        {cls.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="text-xs sm:text-sm text-text-muted font-manrope mt-2 line-clamp-3">{cls.description}</p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Schedule */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">{formatSchedule(cls)}</p>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">
                      {cls.start_date ? new Date(cls.start_date).toLocaleDateString() : 'N/A'} — {cls.end_date ? new Date(cls.end_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  {/* Location / School */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">{cls.location || schoolName || 'To be announced'}</p>
                    {schoolCode && <p className="text-xs text-text-muted font-mono mt-0.5">Code: {schoolCode}</p>}
                  </div>

                  {/* Capacity */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">
                      <span className="font-semibold">{cls.current_enrollment || 0}</span>
                      <span className="text-text-muted"> / {cls.capacity || 0} enrolled</span>
                    </p>
                  </div>

                  {/* Age Range */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age Range</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">{cls.min_age || 0} – {cls.max_age || 18} years</p>
                  </div>

                  {/* Class Type */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Tag className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class Type</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope">{classType}</p>
                  </div>

                  {/* Price */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</span>
                    </div>
                    <p className="text-sm text-text-primary font-manrope font-semibold">{priceDisplay}</p>
                  </div>

                  {/* Coaches */}
                  {coaches.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <User className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coach{coaches.length > 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {coaches.map((coach, idx) => (
                          <span key={coach.id || idx} className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-text-primary font-manrope">
                            {coach.full_name || coach.name || `${coach.first_name || ''} ${coach.last_name || ''}`.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration Link */}
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Registration Link</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={cls.registration_link || cls.registration_url || registrationLink}
                      className="flex-1 text-xs sm:text-sm bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-blue-700 font-mono truncate"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(cls.registration_link || cls.registration_url || registrationLink);
                          toast.success('Registration link copied!');
                        } catch {
                          toast.error('Failed to copy link');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Website Link */}
                {cls.website_link && (
                  <div className="mt-3">
                    <a
                      href={cls.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-manrope"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Website
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t bg-gray-50">
                <button
                  onClick={closeViewModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-manrope"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    handleEditClass(cls);
                  }}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-btn-gold rounded-lg hover:bg-btn-gold/90 transition-colors font-manrope"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  Edit Class
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}