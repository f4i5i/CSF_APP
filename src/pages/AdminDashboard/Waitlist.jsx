/**
 * Waitlist Management Page
 * Admin page for managing class waitlists
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, X, Bell } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import waitlistService from '../../api/services/waitlist.service';
import Header from '../../components/Header';

export default function Waitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await waitlistService.getAll({
        class_id: classFilter,
        search: searchQuery,
      });
      setWaitlistEntries(response.data || response);
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
    } finally {
      setLoading(false);
    }
  }, [classFilter, searchQuery]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const handleMoveToEnrolled = async (waitlistId) => {
    try {
      await waitlistService.moveToEnrolled(waitlistId, { notify: true });
      alert('Student moved to enrolled successfully');
      fetchWaitlist();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to move to enrolled:', error);
      alert('Failed to move student to enrolled: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemove = async (waitlistId) => {
    try {
      await waitlistService.remove(waitlistId);
      alert('Removed from waitlist successfully');
      fetchWaitlist();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to remove from waitlist:', error);
      alert('Failed to remove from waitlist');
    }
  };

  const handleNotify = async (waitlistId) => {
    try {
      await waitlistService.notifyAvailable(waitlistId);
      alert('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    }
  };

  const columns = [
    {
      key: 'position',
      label: 'Position',
      sortable: true,
      render: (value) => (
        <div className="w-8 h-8 bg-[#F3BC48] rounded-full flex items-center justify-center">
          <span className="font-bold text-white text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] text-sm">{row.class?.name}</p>
          <p className="text-xs text-gray-500">
            Capacity: {row.class?.current_enrollment || 0}/{row.class?.capacity || 0}
          </p>
        </div>
      ),
    },
    {
      key: 'child',
      label: 'Child',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.child?.first_name} {row.child?.last_name}
          </p>
          <p className="text-xs text-gray-500">Age: {row.child?.age || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
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
      key: 'joined_date',
      label: 'Joined Waitlist',
      type: 'date',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => [
        {
          label: 'Move to Enrolled',
          icon: UserPlus,
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Move to Enrolled',
              message: `Move ${row.child?.first_name} from waitlist to enrolled? They will receive an enrollment notification.`,
              action: () => handleMoveToEnrolled(row.id),
            });
          },
        },
        {
          label: 'Notify Spot Available',
          icon: Bell,
          onClick: () => handleNotify(row.id),
        },
        {
          label: 'Remove from Waitlist',
          icon: X,
          variant: 'destructive',
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Remove from Waitlist',
              message: `Remove ${row.child?.first_name} from the waitlist?`,
              action: () => handleRemove(row.id),
            });
          },
        },
      ],
    },
  ];

  const filters = [];

  const hasActiveFilters = classFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery('');
    setClassFilter('');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
            emptyMessage="No students on waitlist"
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
