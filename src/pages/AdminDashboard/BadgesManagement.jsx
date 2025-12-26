/**
 * Badges Management Page
 * Admin page for managing badges and awarding them to students
 */

import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, Gift, Search } from 'lucide-react';
import Header from '../../components/Header';
import badgesService from '../../api/services/badges.service';
import enrollmentsService from '../../api/services/enrollments.service';
import toast from 'react-hot-toast';

const BADGE_CATEGORIES = [
  { value: 'achievement', label: 'Achievement' },
  { value: 'participation', label: 'Participation' },
  { value: 'skill', label: 'Skill' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'sportsmanship', label: 'Sportsmanship' },
  { value: 'special', label: 'Special' },
];

export default function BadgesManagement() {
  const [badges, setBadges] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'achievement',
    icon_url: '',
  });
  const [awardData, setAwardData] = useState({
    badge_id: '',
    enrollment_id: '',
    notes: '',
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBadges();
    fetchEnrollments();
  }, [categoryFilter]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      const response = await badgesService.getAll(filters);
      setBadges(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsService.getAll({ limit: 200, status: 'active' });
      setEnrollments(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const handleCreateBadge = () => {
    setSelectedBadge(null);
    setFormData({
      name: '',
      description: '',
      category: 'achievement',
      icon_url: '',
    });
    setShowBadgeModal(true);
  };

  const handleEditBadge = (badge) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge.name || '',
      description: badge.description || '',
      category: badge.category || 'achievement',
      icon_url: badge.icon_url || '',
    });
    setShowBadgeModal(true);
  };

  const handleDeleteBadge = (badge) => {
    setSelectedBadge(badge);
    setShowDeleteModal(true);
  };

  const handleAwardBadge = (badge = null) => {
    setAwardData({
      badge_id: badge?.id || '',
      enrollment_id: '',
      notes: '',
    });
    setStudentSearch('');
    setShowAwardModal(true);
  };

  const handleSubmitBadge = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Badge name is required');
      return;
    }

    setSaving(true);
    try {
      if (selectedBadge) {
        await badgesService.update(selectedBadge.id, formData);
        toast.success('Badge updated successfully');
      } else {
        await badgesService.create(formData);
        toast.success('Badge created successfully');
      }
      setShowBadgeModal(false);
      fetchBadges();
    } catch (error) {
      console.error('Failed to save badge:', error);
      toast.error(error.response?.data?.detail || 'Failed to save badge');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAward = async (e) => {
    e.preventDefault();
    if (!awardData.badge_id || !awardData.enrollment_id) {
      toast.error('Please select both a badge and a student');
      return;
    }

    setSaving(true);
    try {
      await badgesService.awardBadge({
        badge_id: awardData.badge_id,
        enrollment_id: awardData.enrollment_id,
        notes: awardData.notes || undefined,
      });
      toast.success('Badge awarded successfully!');
      setShowAwardModal(false);
      fetchBadges();
    } catch (error) {
      console.error('Failed to award badge:', error);
      toast.error(error.response?.data?.detail || 'Failed to award badge');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBadge) return;
    setSaving(true);
    try {
      await badgesService.delete(selectedBadge.id);
      toast.success('Badge deleted successfully');
      setShowDeleteModal(false);
      setSelectedBadge(null);
      fetchBadges();
    } catch (error) {
      console.error('Failed to delete badge:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete badge');
    } finally {
      setSaving(false);
    }
  };

  // Filter badges by search query
  const filteredBadges = badges.filter((b) =>
    `${b.name} ${b.description} ${b.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Filter enrollments by search for award modal
  const filteredEnrollments = enrollments.filter((e) =>
    `${e.child_first_name} ${e.child_last_name} ${e.class_name}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colors = {
      achievement: 'bg-yellow-100 text-yellow-800',
      participation: 'bg-blue-100 text-blue-800',
      skill: 'bg-green-100 text-green-800',
      attendance: 'bg-purple-100 text-purple-800',
      sportsmanship: 'bg-pink-100 text-pink-800',
      special: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Badges Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Create badges and award them to students
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAwardBadge()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#173151] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Gift className="w-4 h-4" />
                Award Badge
              </button>
              <button
                onClick={handleCreateBadge}
                className="flex items-center gap-2 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Badge
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search badges..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
            >
              <option value="">All Categories</option>
              {BADGE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-gold"></div>
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No badges found</h3>
            <p className="text-gray-500 mb-4">Create your first badge to get started</p>
            <button
              onClick={handleCreateBadge}
              className="px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a]"
            >
              Create Badge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F3BC48] to-[#e5ae3a] flex items-center justify-center">
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-8 h-8" />
                    ) : (
                      <Award className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAwardBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-[#F3BC48] hover:bg-gray-100 rounded"
                      title="Award this badge"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-[#173151] mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{badge.description || 'No description'}</p>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(badge.category)}`}>
                    {badge.category || 'General'}
                  </span>
                  {badge.awards_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {badge.awards_count} awarded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Badge Modal */}
        {showBadgeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-[#173151] mb-4">
                {selectedBadge ? 'Edit Badge' : 'Create New Badge'}
              </h2>

              <form onSubmit={handleSubmitBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="Badge name"
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
                    placeholder="Badge description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                  >
                    {BADGE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBadgeModal(false)}
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
                    {saving ? 'Saving...' : selectedBadge ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Award Badge Modal */}
        {showAwardModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F3BC48]/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#F3BC48]" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Award Badge</h2>
              </div>

              <form onSubmit={handleSubmitAward} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Badge <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={awardData.badge_id}
                    onChange={(e) => setAwardData({ ...awardData, badge_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                  >
                    <option value="">Choose a badge...</option>
                    {badges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.name} ({badge.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredEnrollments.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 text-center">No students found</p>
                    ) : (
                      filteredEnrollments.slice(0, 10).map((enrollment) => (
                        <button
                          key={enrollment.id}
                          type="button"
                          onClick={() => setAwardData({ ...awardData, enrollment_id: enrollment.id })}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0 ${
                            awardData.enrollment_id === enrollment.id ? 'bg-[#F3BC48]/20' : ''
                          }`}
                        >
                          <span className="font-medium">
                            {enrollment.child_first_name} {enrollment.child_last_name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            - {enrollment.class_name || 'Unknown Class'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={awardData.notes}
                    onChange={(e) => setAwardData({ ...awardData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] resize-none"
                    placeholder="Why is this badge being awarded?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAwardModal(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !awardData.badge_id || !awardData.enrollment_id}
                    className="flex-1 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] disabled:opacity-50"
                  >
                    {saving ? 'Awarding...' : 'Award Badge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedBadge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Delete Badge</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedBadge.name}</strong>? This will also remove it from all students who earned it.
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
                  {saving ? 'Deleting...' : 'Delete Badge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
