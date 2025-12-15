/**
 * WaiversManagement - Admin page for managing waiver templates
 * List, create, edit, delete waiver templates
 */

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks';
import waiversService from '../../api/services/waivers.service';
import WaiverFormModal from '../../components/admin/WaiverFormModal';
import WaiverVersionModal from '../../components/admin/WaiverVersionModal';

const WaiversManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWaiver, setEditingWaiver] = useState(null);
  const [viewingWaiver, setViewingWaiver] = useState(null);
  const [versionInfoWaiver, setVersionInfoWaiver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [filterType, setFilterType] = useState('all'); // all, liability, medical_release, etc.

  // Fetch waivers
  const {
    data: waiversResponse,
    loading,
    error,
    refetch,
  } = useApi(
    () => waiversService.getTemplates({ include_inactive: true }),
    {
      initialData: { items: [], total: 0 },
    }
  );

  // Extract waivers from response
  const waivers = waiversResponse?.items || [];

  // Filtered waivers
  const filteredWaivers = waivers.filter((waiver) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        waiver.name?.toLowerCase().includes(searchLower) ||
        waiver.waiver_type?.toLowerCase().includes(searchLower) ||
        waiver.content?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !waiver.is_active) return false;
      if (filterStatus === 'inactive' && waiver.is_active) return false;
    }

    // Type filter
    if (filterType !== 'all' && waiver.waiver_type !== filterType) {
      return false;
    }

    return true;
  });

  const handleDelete = async (waiverId, waiverName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${waiverName}"?\n\nThis will deactivate the waiver template. Users who have already signed will retain their records.`
      )
    ) {
      return;
    }

    try {
      await waiversService.deleteTemplate(waiverId);
      toast.success('Waiver template deleted successfully');
      refetch();
    } catch (error) {
      console.error('Failed to delete waiver:', error);
      toast.error('Failed to delete waiver template');
    }
  };

  const handleFormSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const getStatusBadge = (waiver) => {
    if (!waiver.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    if (waiver.is_required) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        <Clock className="w-3 h-3" />
        Optional
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      liability: 'bg-red-100 text-red-700',
      medical_release: 'bg-purple-100 text-purple-700',
      photo_release: 'bg-blue-100 text-blue-700',
      cancellation_policy: 'bg-orange-100 text-orange-700',
    };

    const typeLabels = {
      liability: 'Liability',
      medical_release: 'Medical',
      photo_release: 'Photo',
      cancellation_policy: 'Cancellation',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          typeColors[type] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {typeLabels[type] || type}
      </span>
    );
  };

  const getScopeLabel = (waiver) => {
    if (waiver.applies_to_program_id && waiver.applies_to_school_id) {
      return 'Program & School Specific';
    }
    if (waiver.applies_to_program_id) {
      return 'Program Specific';
    }
    if (waiver.applies_to_school_id) {
      return 'School Specific';
    }
    return 'Global';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Failed to load waivers</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#173151]">
                Waiver Templates
              </h1>
              <p className="text-gray-600 mt-2">
                Manage waiver templates for enrollments
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#173151] text-white rounded-lg font-semibold hover:bg-[#1f3d67] transition"
            >
              <Plus className="w-5 h-5" />
              Create Waiver
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search waivers by name, type, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
              >
                <option value="all">All Types</option>
                <option value="liability">Liability</option>
                <option value="medical_release">Medical Release</option>
                <option value="photo_release">Photo Release</option>
                <option value="cancellation_policy">Cancellation Policy</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredWaivers.length} of {waiversResponse?.total || 0} waiver
            {(waiversResponse?.total || 0) !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Waivers List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#173151] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading waivers...</p>
          </div>
        ) : filteredWaivers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium text-lg">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'No waivers match your filters'
                : 'No waiver templates yet'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-[#173151] text-white rounded-lg hover:bg-[#1f3d67] transition"
              >
                Create Your First Waiver
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWaivers.map((waiver) => (
              <div
                key={waiver.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#173151]">
                        {waiver.name}
                      </h3>
                      {getTypeBadge(waiver.waiver_type)}
                      {getStatusBadge(waiver)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Version {waiver.version}</span>
                      <span>•</span>
                      <span>{getScopeLabel(waiver)}</span>
                      <span>•</span>
                      <span>
                        Created{' '}
                        {new Date(waiver.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">
                      {waiver.content}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setVersionInfoWaiver(waiver)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Version Info & Stats"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewingWaiver(waiver)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="View Full Content"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingWaiver(waiver)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Waiver"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(waiver.id, waiver.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Waiver"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWaiver) && (
        <WaiverFormModal
          waiver={editingWaiver}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWaiver(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Modal */}
      {viewingWaiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#173151]">
                  {viewingWaiver.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {getTypeBadge(viewingWaiver.waiver_type)}
                  {getStatusBadge(viewingWaiver)}
                  <span className="text-sm text-gray-600">
                    Version {viewingWaiver.version}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingWaiver(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-sm">
                {viewingWaiver.content}
              </div>

              {/* Metadata */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Scope:</span>
                  <span className="ml-2 font-medium">
                    {getScopeLabel(viewingWaiver)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Required:</span>
                  <span className="ml-2 font-medium">
                    {viewingWaiver.is_required ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(viewingWaiver.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(viewingWaiver.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Info Modal */}
      {versionInfoWaiver && (
        <WaiverVersionModal
          waiver={versionInfoWaiver}
          onClose={() => setVersionInfoWaiver(null)}
        />
      )}
    </div>
  );
};

export default WaiversManagement;
