/**
 * Announcements Management Page
 * Admin page for creating and managing announcements with multi-class support
 * Structure matches EventsManagement.jsx for consistency
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Bell,
  AlertTriangle,
  Info,
  Paperclip,
  Upload,
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import MultiClassSelector from "../../components/admin/MultiClassSelector";
import announcementsService from "../../api/services/announcements.service";
import classesService from "../../api/services/classes.service";
import toast from "react-hot-toast";
import Header from "../../components/Header";

const ANNOUNCEMENT_TYPES = [
  { value: "general", label: "General", icon: Info, color: "blue" },
  { value: "important", label: "Important", icon: Bell, color: "amber" },
  { value: "urgent", label: "Urgent", icon: AlertTriangle, color: "red" },
];

const getTypeConfig = (type) => {
  return (
    ANNOUNCEMENT_TYPES.find((t) => t.value === type) || ANNOUNCEMENT_TYPES[0]
  );
};

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Filter options from API
  const [classes, setClasses] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
    class_ids: [],
  });

  const [attachments, setAttachments] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    setFiltersLoading(true);
    try {
      const response = await classesService.getAll({ limit: 100 });
      const classesList = Array.isArray(response)
        ? response
        : response.items || response.data || [];
      setClasses(classesList);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      setClasses([]);
    } finally {
      setFiltersLoading(false);
    }
  };

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
      };

      if (typeFilter) params.type = typeFilter;
      if (classFilter) params.class_id = classFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await announcementsService.getAll(params);
      const announcementsData = Array.isArray(response)
        ? response
        : response.items || [];
      const total = response.total || announcementsData.length || 0;

      setAnnouncements(announcementsData);
      setTotalItems(total);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
      setAnnouncements([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, classFilter, searchQuery]);

  // Fetch announcements when filters change
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = () => {
    setModalMode("create");
    setSelectedAnnouncement(null);
    setFormData({
      title: "",
      description: "",
      type: "general",
      class_ids: [],
    });
    setAttachments([]);
    setModalOpen(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setModalMode("edit");
    setSelectedAnnouncement(announcement);

    // Extract class IDs from targets
    const classIds =
      announcement.targets?.map((t) => t.class_id) ||
      (announcement.class_id ? [announcement.class_id] : []);

    setFormData({
      title: announcement.title || "",
      description: announcement.description || "",
      type: announcement.type || announcement.announcement_type || "general",
      class_ids: classIds,
    });
    setAttachments(announcement.attachments || []);
    setModalOpen(true);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await announcementsService.delete(announcementId);
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setViewAnnouncement(announcement);
    setViewModalOpen(true);
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAnnouncement(null);
    setAttachments([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    if (formData.class_ids.length === 0) {
      toast.error("Please select at least one class");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        announcement_type: formData.type,
        class_ids: formData.class_ids,
      };

      let savedAnnouncement;
      if (selectedAnnouncement) {
        savedAnnouncement = await announcementsService.update(
          selectedAnnouncement.id,
          payload
        );
        toast.success("Announcement updated successfully");
      } else {
        savedAnnouncement = await announcementsService.create(payload);
        toast.success("Announcement created successfully");
      }

      // Upload new file attachments
      const newFiles = attachments.filter((a) => a instanceof File);
      for (const file of newFiles) {
        try {
          await announcementsService.uploadAttachment(
            savedAnnouncement.id,
            file
          );
        } catch (err) {
          console.error("Failed to upload attachment:", err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to save announcement:", error);
      toast.error(error.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getClassNames = (announcement) => {
    if (announcement.targets && announcement.targets.length > 0) {
      const names = announcement.targets
        .map((t) => {
          const cls = classes.find((c) => c.id === t.class_id);
          return cls?.name || "Unknown";
        })
        .slice(0, 2);
      if (announcement.targets.length > 2) {
        return `${names.join(", ")} +${announcement.targets.length - 2}`;
      }
      return names.join(", ");
    }
    if (announcement.class_id) {
      const cls = classes.find((c) => c.id === announcement.class_id);
      return cls?.name || "Unknown";
    }
    return "All Classes";
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value) => (
        <span className="font-semibold font-manrope text-text-primary text-sm">
          {truncateText(value, 40)}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value, row) => {
        const type = value || row.announcement_type || "general";
        const config = getTypeConfig(type);
        const colorClasses = {
          blue: "bg-blue-100 text-blue-800",
          amber: "bg-amber-100 text-amber-800",
          red: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colorClasses[config.color]}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "targets",
      label: "Classes",
      render: (_, row) => (
        <span className="text-xs font-manrope text-text-muted">
          {getClassNames(row)}
        </span>
      ),
    },
    {
      key: "attachments",
      label: "Files",
      render: (value) => (
        <span className="text-xs font-manrope text-text-muted">
          {value?.length || 0} {(value?.length || 0) === 1 ? "file" : "files"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value) => (
        <span className="text-xs font-manrope text-text-muted">
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
          label: "View",
          icon: Eye,
          onClick: () => handleViewAnnouncement(row),
        },
        {
          label: "Edit",
          icon: Edit,
          onClick: () => handleEditAnnouncement(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Announcement",
              message: `Are you sure you want to delete "${row.title}"? This action cannot be undone.`,
              action: () => handleDeleteAnnouncement(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [
    {
      type: "select",
      placeholder: "All Types",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: "", label: "All Types" },
        ...ANNOUNCEMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
      ],
    },
    {
      type: "select",
      placeholder: "All Classes",
      value: classFilter,
      onChange: setClassFilter,
      options: [
        { value: "", label: "All Classes" },
        ...classes.map((cls) => ({
          value: cls.id,
          label: cls.name,
        })),
      ],
      disabled: filtersLoading,
    },
  ];

  const hasActiveFilters = typeFilter || classFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setClassFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate">
              Announcements Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Create and manage announcements for your programs
            </p>
          </div>

          <button
            onClick={handleCreateAnnouncement}
            className="flex items-center gap-1.5 sm:gap-2 font-manrope bg-btn-gold text-text-body px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Create </span>Announcement
          </button>
        </div>

        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by title or description..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-2">
          <DataTable
            columns={columns}
            data={announcements}
            loading={loading}
            emptyMessage="No announcements found"
            pagination={true}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Announcement Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-text-primary mb-4 font-manrope">
              {modalMode === "edit"
                ? "Edit Announcement"
                : "Create New Announcement"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold resize-none font-manrope"
                  placeholder="Announcement content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                >
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Class Selector */}
              <MultiClassSelector
                classes={classes}
                selectedIds={formData.class_ids}
                onChange={(ids) => setFormData({ ...formData, class_ids: ids })}
                label="Target Classes *"
                disabled={filtersLoading}
              />

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-manrope">
                      Click to upload files
                    </span>
                  </label>
                </div>

                {/* Attachment list */}
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-manrope text-gray-700 truncate max-w-[200px]">
                            {file.name || file.file_name || "Attachment"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-manrope"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-btn-gold text-text-body rounded-lg font-semibold hover:bg-btn-gold/90 disabled:opacity-50 font-manrope"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "edit"
                    ? "Update Announcement"
                    : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />

      {/* View Announcement Modal */}
      {viewModalOpen && viewAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary font-manrope">
                Announcement Details
              </h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-text-primary font-manrope">
                  {viewAnnouncement.title}
                </h3>
                {(() => {
                  const type =
                    viewAnnouncement.type ||
                    viewAnnouncement.announcement_type ||
                    "general";
                  const config = getTypeConfig(type);
                  const colorClasses = {
                    blue: "bg-blue-100 text-blue-800",
                    amber: "bg-amber-100 text-amber-800",
                    red: "bg-red-100 text-red-800",
                  };
                  return (
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold capitalize ${colorClasses[config.color]}`}
                    >
                      {config.label}
                    </span>
                  );
                })()}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                  Description
                </label>
                <p className="text-text-primary font-manrope whitespace-pre-wrap">
                  {viewAnnouncement.description}
                </p>
              </div>

              {/* Target Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                  Target Classes
                </label>
                <div className="flex flex-wrap gap-2">
                  {viewAnnouncement.targets?.length > 0 ? (
                    viewAnnouncement.targets.map((target) => {
                      const cls = classes.find((c) => c.id === target.class_id);
                      return (
                        <span
                          key={target.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-manrope"
                        >
                          {cls?.name || target.class_id}
                        </span>
                      );
                    })
                  ) : viewAnnouncement.class_id ? (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-manrope">
                      {classes.find((c) => c.id === viewAnnouncement.class_id)
                        ?.name || viewAnnouncement.class_id}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 font-manrope">
                      All Classes
                    </span>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {viewAnnouncement.attachments?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    Attachments
                  </label>
                  <div className="space-y-1">
                    {viewAnnouncement.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-manrope text-gray-700">
                          {attachment.file_name || `Attachment ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                  Created
                </label>
                <span className="text-text-primary font-manrope">
                  {formatDate(viewAnnouncement.created_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setViewModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-manrope"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditAnnouncement(viewAnnouncement);
                }}
                className="flex-1 px-4 py-2 bg-btn-gold text-text-body rounded-lg font-semibold hover:bg-btn-gold/90 font-manrope flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
