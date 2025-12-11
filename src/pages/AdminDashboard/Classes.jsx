/**
 * Classes Management Page
 * Admin page for managing classes with Stripe payment configuration
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ClassFormModal from '../../components/admin/ClassFormModal';
import classesService from '../../api/services/classes.service';
import toast from 'react-hot-toast';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedClass, setSelectedClass] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    fetchClasses();
  }, [currentPage, programFilter, areaFilter, statusFilter, searchQuery]);

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
      setClasses(response.data || response);
      setTotalItems(response.total || response.length);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setModalMode('create');
    setSelectedClass(null);
    setModalOpen(true);
  };

  const handleEditClass = (classData) => {
    setModalMode('edit');
    setSelectedClass(classData);
    setModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    try {
      await classesService.delete(classId);
      toast.success('Class deleted successfully');
      fetchClasses();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast.error('Failed to delete class');
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
    if (!schedule || schedule.length === 0) return 'No schedule';
    return schedule.map(s => {
      const day = s.day_of_week?.substring(0, 3).toUpperCase();
      return `${day} ${s.start_time}-${s.end_time}`;
    }).join(', ');
  };

  const columns = [
    {
      key: 'name',
      label: 'Class Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">{value}</p>
          <p className="text-xs text-gray-500">{row.program?.name || 'No Program'}</p>
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (value, row) => (
        <div className="text-sm text-gray-700">
          <Calendar className="inline w-4 h-4 mr-1" />
          {formatSchedule(row.schedule)}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value, row) => (
        <div className="text-sm">
          <span className="font-semibold">{row.current_enrollment || 0}</span>
          <span className="text-gray-500"> / {value}</span>
        </div>
      ),
    },
    {
      key: 'age_range',
      label: 'Age Range',
      render: (value, row) => (
        <span className="text-sm text-gray-700">
          {row.min_age || 0} - {row.max_age || 18} yrs
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
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
          label: 'Edit Class',
          icon: Edit,
          onClick: () => handleEditClass(row),
        },
        {
          label: 'Delete Class',
          icon: Trash2,
          variant: 'destructive',
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Delete Class',
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
      type: 'select',
      placeholder: 'All Programs',
      value: programFilter,
      onChange: setProgramFilter,
      options: [
        { value: '', label: 'All Programs' },
        // TODO: Fetch actual programs from API
      ],
    },
    {
      type: 'select',
      placeholder: 'All Areas',
      value: areaFilter,
      onChange: setAreaFilter,
      options: [
        { value: '', label: 'All Areas' },
        // TODO: Fetch actual areas from API
      ],
    },
    {
      type: 'select',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const hasActiveFilters = programFilter || areaFilter || statusFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery('');
    setProgramFilter('');
    setAreaFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#173151] font-manrope">
              Classes Management
            </h1>
            <p className="text-gray-600 font-manrope mt-1">
              Create and manage classes with Stripe payment options
            </p>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 bg-[#F3BC48] hover:bg-[#e5ad35] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
