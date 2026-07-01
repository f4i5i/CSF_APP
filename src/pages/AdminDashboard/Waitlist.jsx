/**
 * Waitlist Management Page
 * Admin page for managing class waitlists
 */

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, X, GraduationCap } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import enrollmentsService from "../../api/services/enrollments.service";
import classesService from "../../api/services/classes.service";
import Header from "../../components/Header";

export default function Waitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  // Load classes to drive the required class selector (the real waitlist
  // list endpoint is scoped to a single class).
  useEffect(() => {
    (async () => {
      try {
        const response = await classesService.getAll({ limit: 200 });
        setClasses(response?.items || response || []);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    })();
  }, []);

  const fetchWaitlist = useCallback(async () => {
    // The backend lists the waitlist per class, so a class must be selected.
    if (!classFilter) {
      setWaitlistEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await enrollmentsService.getClassWaitlist(classFilter);
      const entries = (response?.entries || []).map((entry) => ({
        id: entry.enrollment_id,
        position: entry.position,
        class: { name: entry.class_name },
        child: { first_name: entry.child_name },
        parent: {},
        joined_date: entry.created_at,
        status: entry.waitlist_priority,
      }));
      const query = searchQuery.trim().toLowerCase();
      setWaitlistEntries(
        query
          ? entries.filter((row) =>
              [row.child?.first_name, row.class?.name]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(query)),
            )
          : entries,
      );
    } catch (error) {
      console.error("Failed to fetch waitlist:", error);
    } finally {
      setLoading(false);
    }
  }, [classFilter, searchQuery]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const handleMoveToEnrolled = async (enrollmentId) => {
    try {
      await enrollmentsService.promoteFromWaitlist(enrollmentId);
      alert("Student promoted from waitlist successfully");
      fetchWaitlist();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to promote from waitlist:", error);
      alert(
        "Failed to promote student from waitlist: " +
          (error.message || "Unknown error"),
      );
    }
  };

  const handleRemove = async (enrollmentId) => {
    try {
      await enrollmentsService.delete(enrollmentId);
      alert("Removed from waitlist successfully");
      fetchWaitlist();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to remove from waitlist:", error);
      alert("Failed to remove from waitlist");
    }
  };

  const columns = [
    {
      key: "position",
      label: "Position",
      sortable: true,
      render: (value) => (
        <div className="w-8 h-8 bg-[#F3BC48] rounded-full flex items-center justify-center">
          <span className="font-bold text-white text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] text-sm">
            {row.class?.name}
          </p>
          <p className="text-xs text-gray-500">
            Capacity: {row.class?.current_enrollment || 0}/
            {row.class?.capacity || 0}
          </p>
        </div>
      ),
    },
    {
      key: "child",
      label: "Child",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.child?.first_name} {row.child?.last_name}
          </p>
          <p className="text-xs text-gray-500">
            Age: {row.child?.age || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "parent",
      label: "Parent",
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-700">
            {row.parent?.first_name} {row.parent?.last_name}
          </p>
          <p className="text-xs text-gray-500">{row.parent?.email}</p>
        </div>
      ),
    },
    {
      key: "joined_date",
      label: "Joined Waitlist",
      type: "date",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "right",
      actions: (row) => [
        {
          label: "Move to Enrolled",
          icon: UserPlus,
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Move to Enrolled",
              message: `Move ${row.child?.first_name} from waitlist to enrolled? They will receive an enrollment notification.`,
              action: () => handleMoveToEnrolled(row.id),
            });
          },
        },
        {
          label: "Remove from Waitlist",
          icon: X,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Remove from Waitlist",
              message: `Remove ${row.child?.first_name} from the waitlist?`,
              action: () => handleRemove(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      icon: GraduationCap,
      value: classFilter,
      placeholder: "Select a class",
      onChange: setClassFilter,
      options: (classes || []).map((cls) => ({
        value: cls.id,
        label: cls.name,
      })),
    },
  ];

  const hasActiveFilters = classFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setClassFilter("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate">
              Waitlist Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Manage students on class waitlists
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by child name, parent, or class..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-2">
          <DataTable
            columns={columns}
            data={waitlistEntries}
            loading={loading}
            emptyMessage={
              classFilter
                ? "No students on waitlist"
                : "Select a class to view its waitlist"
            }
            pagination={false}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="info"
      />
    </div>
  );
}
