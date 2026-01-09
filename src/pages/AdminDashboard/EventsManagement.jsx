/**
 * Events Management Page
 * Admin page for creating and managing events
 * Supports multi-class events via EventTarget
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, Eye, X } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import FilterBar from "../../components/admin/FilterBar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import MultiClassSelector from "../../components/admin/MultiClassSelector";
import eventsService from "../../api/services/events.service";
import classesService from "../../api/services/classes.service";
import areasService from "../../api/services/areas.service";
import toast from "react-hot-toast";
import Header from "../../components/Header";

const EVENT_TYPES = [
  { value: "tournament", label: "Tournament" },
  { value: "practice", label: "Practice" },
  { value: "social", label: "Social" },
  { value: "showcase", label: "Showcase" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Filter options from API
  const [classes, setClasses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "practice",
    start_datetime: "",
    end_datetime: "",
    location: "",
    class_ids: [],  // Multi-class support
    max_attendees: "",
    requires_rsvp: true,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [currentPage, typeFilter, classFilter, searchQuery]);

  const fetchFilterOptions = async () => {
    setFiltersLoading(true);
    try {
      const [classesResponse, areasResponse] = await Promise.all([
        classesService.getAll({ limit: 100 }),
        areasService.getAll({ is_active: true }),
      ]);

      const classesList = Array.isArray(classesResponse)
        ? classesResponse
        : classesResponse.items || classesResponse.data || [];
      setClasses(classesList);

      const areasList = Array.isArray(areasResponse)
        ? areasResponse
        : areasResponse.items || areasResponse.data || [];
      setAreas(areasList);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      setClasses([]);
      setAreas([]);
    } finally {
      setFiltersLoading(false);
    }
  };

  const fetchEvents = async () => {
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

      const response = await eventsService.getAll(params);
      const eventsData = response.items || response || [];
      const total = response.total || eventsData.length || 0;

      setEvents(eventsData);
      setTotalItems(total);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
      setEvents([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setModalMode("create");
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      type: "practice",
      start_datetime: "",
      end_datetime: "",
      location: "",
      class_ids: [],  // Multi-class support
      max_attendees: "",
      requires_rsvp: true,
    });
    setModalOpen(true);
  };

  const handleEditEvent = (eventData) => {
    setModalMode("edit");
    setSelectedEvent(eventData);

    // Extract class IDs from targets or legacy class_id
    const classIds =
      eventData.targets?.map((t) => t.class_id) ||
      (eventData.class_id ? [eventData.class_id] : []);

    setFormData({
      title: eventData.title || "",
      description: eventData.description || "",
      type: eventData.type || "practice",
      start_datetime: eventData.start_datetime
        ? eventData.start_datetime.slice(0, 16)
        : "",
      end_datetime: eventData.end_datetime
        ? eventData.end_datetime.slice(0, 16)
        : "",
      location: eventData.location || "",
      class_ids: classIds,  // Multi-class support
      max_attendees: eventData.max_attendees || "",
      requires_rsvp: eventData.requires_rsvp ?? true,
    });
    setModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsService.delete(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleViewEvent = (eventData) => {
    setViewEvent(eventData);
    setViewModalOpen(true);
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_datetime) {
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
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime || null,
        location: formData.location,
        class_ids: formData.class_ids,  // Multi-class support
        max_attendees: formData.max_attendees
          ? parseInt(formData.max_attendees)
          : null,
        requires_rsvp: formData.requires_rsvp,
      };

      if (selectedEvent) {
        await eventsService.update(selectedEvent.id, payload);
        toast.success("Event updated successfully");
      } else {
        await eventsService.create(payload);
        toast.success("Event created successfully");
      }
      setModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error(error.response?.data?.detail || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const columns = [
    {
      key: "title",
      label: "Event",
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
      render: (value) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "start_datetime",
      label: "Date/Time",
      render: (value) => (
        <span className="text-xs font-manrope text-text-muted">
          {formatDateTime(value)}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (value) => (
        <span className="text-xs font-manrope text-text-muted">
          {truncateText(value || "TBD", 20)}
        </span>
      ),
    },
    {
      key: "max_attendees",
      label: "Capacity",
      render: (value, row) => (
        <span className="text-xs font-manrope text-text-primary">
          {row.rsvp_count || 0}/{value || "∞"}
        </span>
      ),
    },
    {
      key: "requires_rsvp",
      label: "RSVP",
      render: (value) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            value
              ? "bg-[#DFF5E8] text-status-success"
              : "bg-neutral-lightest text-neutral-dark"
          }`}
        >
          {value ? "Yes" : "No"}
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
          onClick: () => handleViewEvent(row),
        },
        {
          label: "Edit",
          icon: Edit,
          onClick: () => handleEditEvent(row),
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: "Delete Event",
              message: `Are you sure you want to delete "${row.title}"? This action cannot be undone.`,
              action: () => handleDeleteEvent(row.id),
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
        ...EVENT_TYPES,
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
    <div className="h-full">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-4 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-2 justify-between">
          <div>
            <h1 className="lg:text-[36px] text-[20px] md:text-[28px] font-bold text-text-primary font-kollektif">
              Events Management
            </h1>
            <p className="text-neutral-main font-manrope text-sm">
              Create and manage events for your programs
            </p>
          </div>

          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 font-manrope bg-btn-gold text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by event name or description..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={events}
          loading={loading}
          emptyMessage="No events found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Event Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 my-auto">
            <h2 className="text-xl font-semibold text-text-primary mb-4 font-manrope">
              {modalMode === "edit" ? "Edit Event" : "Create New Event"}
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
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold resize-none font-manrope"
                  placeholder="Event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    {EVENT_TYPES.map((type) => (
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
                  maxHeight="120px"
                  disabled={filtersLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                    Start Date/Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) =>
                      setFormData({ ...formData, start_datetime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                    End Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) =>
                      setFormData({ ...formData, end_datetime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                  Location (Area)
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                >
                  <option value="">Select a location</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-manrope">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) =>
                      setFormData({ ...formData, max_attendees: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-btn-gold focus:border-btn-gold font-manrope"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-manrope">
                    <input
                      type="checkbox"
                      checked={formData.requires_rsvp}
                      onChange={(e) =>
                        setFormData({ ...formData, requires_rsvp: e.target.checked })
                      }
                      className="w-4 h-4 text-btn-gold border-gray-300 rounded focus:ring-btn-gold"
                    />
                    <span className="text-sm text-gray-700">Require RSVP</span>
                  </label>
                </div>
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
                    ? "Update Event"
                    : "Create Event"}
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

      {/* View Event Modal */}
      {viewModalOpen && viewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary font-manrope">
                Event Details
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
                  {viewEvent.title}
                </h3>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 capitalize">
                  {viewEvent.type || "Event"}
                </span>
              </div>

              {/* Description */}
              {viewEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    Description
                  </label>
                  <p className="text-text-primary font-manrope whitespace-pre-wrap">
                    {viewEvent.description}
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    Start Date/Time
                  </label>
                  <div className="flex items-center gap-2 text-text-primary font-manrope">
                    <Clock className="w-4 h-4 text-text-muted" />
                    {formatDateTime(viewEvent.start_datetime)}
                  </div>
                </div>
                {viewEvent.end_datetime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                      End Date/Time
                    </label>
                    <div className="flex items-center gap-2 text-text-primary font-manrope">
                      <Clock className="w-4 h-4 text-text-muted" />
                      {formatDateTime(viewEvent.end_datetime)}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              {viewEvent.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    Location
                  </label>
                  <div className="flex items-center gap-2 text-text-primary font-manrope">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    {viewEvent.location}
                  </div>
                </div>
              )}

              {/* Capacity & RSVP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    Capacity
                  </label>
                  <div className="flex items-center gap-2 text-text-primary font-manrope">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="font-semibold">{viewEvent.rsvp_count || 0}</span>
                    <span className="text-text-muted">/ {viewEvent.max_attendees || "Unlimited"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 font-manrope">
                    RSVP Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      viewEvent.requires_rsvp
                        ? "bg-[#DFF5E8] text-status-success"
                        : "bg-neutral-lightest text-neutral-dark"
                    }`}
                  >
                    {viewEvent.requires_rsvp ? "Required" : "Open Event"}
                  </span>
                </div>
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
                  handleEditEvent(viewEvent);
                }}
                className="flex-1 px-4 py-2 bg-btn-gold text-text-body rounded-lg font-semibold hover:bg-btn-gold/90 font-manrope flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
