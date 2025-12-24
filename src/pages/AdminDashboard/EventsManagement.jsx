/**
 * Events Management Page
 * Admin page for creating and managing events
 */

import React, { useState, useEffect } from 'react';
import { Calendar, List, Plus, Edit, Trash2, MapPin, Clock, Users, CalendarDays } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import Header from '../../components/Header';
import eventsService from '../../api/services/events.service';
import classesService from '../../api/services/classes.service';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { value: 'tournament', label: 'Tournament' },
  { value: 'practice', label: 'Practice' },
  { value: 'social', label: 'Social' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

export default function EventsManagement() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'practice',
    start_datetime: '',
    end_datetime: '',
    location: '',
    class_id: '',
    max_attendees: '',
    requires_rsvp: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchClasses();
  }, [currentPage, typeFilter, classFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const filters = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (typeFilter) filters.type = typeFilter;
      if (classFilter) filters.class_id = classFilter;

      const response = await eventsService.getAll(filters);
      setEvents(response.items || response || []);
      setTotalItems(response.total || response?.length || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classesService.getAll({ limit: 100 });
      setClasses(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'practice',
      start_datetime: '',
      end_datetime: '',
      location: '',
      class_id: '',
      max_attendees: '',
      requires_rsvp: true,
    });
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      type: event.type || 'practice',
      start_datetime: event.start_datetime ? event.start_datetime.slice(0, 16) : '',
      end_datetime: event.end_datetime ? event.end_datetime.slice(0, 16) : '',
      location: event.location || '',
      class_id: event.class_id || '',
      max_attendees: event.max_attendees || '',
      requires_rsvp: event.requires_rsvp ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_datetime) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        class_id: formData.class_id || null,
      };

      if (selectedEvent) {
        await eventsService.update(selectedEvent.id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventsService.create(payload);
        toast.success('Event created successfully');
      }
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error(error.response?.data?.detail || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      await eventsService.delete(selectedEvent.id);
      toast.success('Event deleted successfully');
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete event');
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Event',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">{value}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'start_datetime',
      label: 'Start',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3 h-3 text-gray-400" />
          {formatDateTime(value)}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="w-3 h-3 text-gray-400" />
          {value || 'TBD'}
        </div>
      ),
    },
    {
      key: 'max_attendees',
      label: 'Capacity',
      render: (value, row) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-3 h-3 text-gray-400" />
          {row.rsvp_count || 0} / {value || '∞'}
        </div>
      ),
    },
    {
      key: 'requires_rsvp',
      label: 'RSVP',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {value ? 'Required' : 'Open'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => [
        {
          label: 'Edit',
          icon: Edit,
          onClick: () => handleEdit(row),
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: () => handleDelete(row),
          className: 'text-red-600 hover:text-red-700',
        },
      ],
    },
  ];

  const filters = [
    {
      type: 'select',
      placeholder: 'All Types',
      value: typeFilter,
      onChange: setTypeFilter,
      options: EVENT_TYPES,
    },
    {
      type: 'select',
      placeholder: 'All Classes',
      value: classFilter,
      onChange: setClassFilter,
      options: classes.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

  const hasActiveFilters = searchQuery || typeFilter || classFilter;
  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setClassFilter('');
    setCurrentPage(1);
  };

  // Filter events by search query
  const filteredEvents = events.filter((e) =>
    `${e.title} ${e.description} ${e.location}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Calendar view - group events by date
  const getCalendarData = () => {
    const grouped = {};
    filteredEvents.forEach((event) => {
      const date = new Date(event.start_datetime).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Events Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Create and manage events for your programs
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#173151] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-[#173151] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Calendar
                </button>
              </div>

              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search events..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredEvents}
              loading={loading}
              emptyMessage="No events found"
              pagination={true}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-500 pb-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[400px]">
              {Array.from({ length: 35 }).map((_, i) => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const startDay = firstDay.getDay();
                const date = new Date(today.getFullYear(), today.getMonth(), i - startDay + 1);
                const dateStr = date.toDateString();
                const calendarData = getCalendarData();
                const dayEvents = calendarData[dateStr] || [];
                const isCurrentMonth = date.getMonth() === today.getMonth();
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-1 border rounded-lg ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'border-[#F3BC48] border-2' : 'border-gray-200'}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEdit(event)}
                          className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 my-auto">
              <h2 className="text-xl font-semibold text-[#173151] mb-4">
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] resize-none"
                    placeholder="Event description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class (optional)
                    </label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    >
                      <option value="">No specific class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date/Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_datetime}
                      onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date/Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_datetime}
                      onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="Event location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                      placeholder="Unlimited"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_rsvp}
                        onChange={(e) => setFormData({ ...formData, requires_rsvp: e.target.checked })}
                        className="w-4 h-4 text-[#F3BC48] border-gray-300 rounded focus:ring-[#F3BC48]"
                      />
                      <span className="text-sm text-gray-700">Require RSVP</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Delete Event</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedEvent.title}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
