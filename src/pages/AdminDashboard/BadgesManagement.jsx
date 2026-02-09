/**
 * Badges Management Page
 * Admin page for managing badges and awarding them to students
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Plus, Edit, Trash2, Gift, Search, Upload, X, Palette, Users } from 'lucide-react';
import Header from '../../components/Header';
import badgesService from '../../api/services/badges.service';
import enrollmentsService from '../../api/services/enrollments.service';
import classesService from '../../api/services/classes.service';
import toast from 'react-hot-toast';

const BADGE_CATEGORIES = [
  { value: 'achievement', label: 'Achievement' },
  { value: 'participation', label: 'Participation' },
  { value: 'skill', label: 'Skill' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'sportsmanship', label: 'Sportsmanship' },
  { value: 'special', label: 'Special' },
];

const BADGE_COLORS = [
  { value: 'gold', label: 'Gold', gradient: 'from-[#F3BC48] to-[#e5ae3a]', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { value: 'blue', label: 'Blue', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100', text: 'text-blue-800' },
  { value: 'green', label: 'Green', gradient: 'from-green-500 to-green-600', bg: 'bg-green-100', text: 'text-green-800' },
  { value: 'purple', label: 'Purple', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100', text: 'text-purple-800' },
  { value: 'red', label: 'Red', gradient: 'from-red-500 to-red-600', bg: 'bg-red-100', text: 'text-red-800' },
  { value: 'pink', label: 'Pink', gradient: 'from-pink-500 to-pink-600', bg: 'bg-pink-100', text: 'text-pink-800' },
  { value: 'orange', label: 'Orange', gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100', text: 'text-orange-800' },
  { value: 'teal', label: 'Teal', gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-100', text: 'text-teal-800' },
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
  const [showBulkAwardModal, setShowBulkAwardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'achievement',
    icon_url: '',
    icon_file: null,
    badge_color: 'gold',
  });
  const fileInputRef = useRef(null);
  const [awardData, setAwardData] = useState({
    badge_id: '',
    enrollment_id: '',
    notes: '',
  });
  const [bulkAwardData, setBulkAwardData] = useState({
    badge_id: '',
    class_id: '',
    notes: '',
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBadges = useCallback(async () => {
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
  }, [categoryFilter]);

  useEffect(() => {
    fetchBadges();
    fetchEnrollments();
    fetchClasses();
  }, [fetchBadges]);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsService.getAll({ limit: 200, status: 'active' });
      setEnrollments(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classesService.getAll({ limit: 100, is_active: true });
      setClasses(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleCreateBadge = () => {
    setSelectedBadge(null);
    setFormData({
      name: '',
      description: '',
      category: 'achievement',
      icon_url: '',
      icon_file: null,
      badge_color: 'gold',
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
      icon_file: null,
      badge_color: badge.badge_color || 'gold',
    });
    setShowBadgeModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, icon_file: file, icon_url: '' }));
    }
  };

  const removeIconFile = () => {
    setFormData(prev => ({ ...prev, icon_file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIconPreviewUrl = () => {
    if (formData.icon_file) {
      return URL.createObjectURL(formData.icon_file);
    }
    if (formData.icon_url) {
      return formData.icon_url;
    }
    return null;
  };

  const getBadgeColorGradient = (colorValue) => {
    const color = BADGE_COLORS.find(c => c.value === colorValue);
    return color ? color.gradient : 'from-[#F3BC48] to-[#e5ae3a]';
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

  const handleBulkAwardBadge = (badge = null) => {
    setBulkAwardData({
      badge_id: badge?.id || '',
      class_id: '',
      notes: '',
    });
    setClassSearch('');
    setShowBulkAwardModal(true);
  };

  const handleSubmitBulkAward = async (e) => {
    e.preventDefault();
    if (!bulkAwardData.badge_id || !bulkAwardData.class_id) {
      toast.error('Please select both a badge and a class');
      return;
    }

    setSaving(true);
    try {
      const result = await badgesService.awardBadgeToClass({
        badge_id: bulkAwardData.badge_id,
        class_id: bulkAwardData.class_id,
        notes: bulkAwardData.notes || undefined,
      });

      const successCount = result.success_count || result.awarded || 0;
      const failCount = result.fail_count || result.failed || 0;

      if (failCount > 0) {
        toast.success(`Badge awarded to ${successCount} students (${failCount} already had it)`);
      } else {
        toast.success(`Badge awarded to ${successCount} students!`);
      }

      setShowBulkAwardModal(false);
      fetchBadges();
    } catch (error) {
      console.error('Failed to bulk award badge:', error);
      toast.error(error.message || 'Failed to award badge to class');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitBadge = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Badge name is required');
      return;
    }

    setSaving(true);
    try {
      // Prepare badge data
      const badgeData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        badge_color: formData.badge_color,
      };

      // Handle icon - prefer file upload over URL
      if (formData.icon_file) {
        // TODO: Upload file to storage and get URL
        // For now, we'll create an object URL (in production, upload to S3/Cloud Storage)
        badgeData.icon_url = URL.createObjectURL(formData.icon_file);
      } else if (formData.icon_url) {
        badgeData.icon_url = formData.icon_url;
      }

      if (selectedBadge) {
        await badgesService.update(selectedBadge.id, badgeData);
        toast.success('Badge updated successfully');
      } else {
        await badgesService.create(badgeData);
        toast.success('Badge created successfully');
      }
      setShowBadgeModal(false);
      fetchBadges();
    } catch (error) {
      console.error('Failed to save badge:', error);
      toast.error(error.message || 'Failed to save badge');
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
      toast.error(error.message || 'Failed to award badge');
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
      toast.error(error.message || 'Failed to delete badge');
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

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleBulkAwardBadge()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                Award to Class
              </button>
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
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getBadgeColorGradient(badge.badge_color)} flex items-center justify-center shadow-md`}>
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Award className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleBulkAwardBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded"
                      title="Award to whole class"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAwardBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-[#F3BC48] hover:bg-gray-100 rounded"
                      title="Award to student"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                      title="Edit badge"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                      title="Delete badge"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#173151]">
                  {selectedBadge ? 'Edit Badge' : 'Create New Badge'}
                </h2>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge Preview */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getBadgeColorGradient(formData.badge_color)} flex items-center justify-center shadow-lg`}>
                  {getIconPreviewUrl() ? (
                    <img src={getIconPreviewUrl()} alt="Badge preview" className="w-12 h-12 object-contain" />
                  ) : (
                    <Award className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>

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

                <div className="grid grid-cols-2 gap-4">
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
                      <Palette className="w-4 h-4 inline mr-1" />
                      Badge Color
                    </label>
                    <select
                      value={formData.badge_color}
                      onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    >
                      {BADGE_COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Preview Chips */}
                <div className="flex flex-wrap gap-2">
                  {BADGE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge_color: color.value })}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} border-2 transition-all ${
                        formData.badge_color === color.value
                          ? 'border-gray-800 scale-110 shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>

                {/* Icon Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Icon
                  </label>

                  {/* File Upload */}
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#F3BC48] transition-colors">
                    {formData.icon_file ? (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={URL.createObjectURL(formData.icon_file)}
                            alt="Preview"
                            className="w-10 h-10 object-contain rounded"
                          />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">
                            {formData.icon_file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeIconFile}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, SVG up to 2MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>

                  {/* Or URL Input */}
                  {!formData.icon_file && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-500">or enter URL</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <input
                        type="url"
                        value={formData.icon_url}
                        onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] text-sm"
                        placeholder="https://example.com/icon.png"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
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
                    disabled={saving || !formData.name.trim()}
                    className="flex-1 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : selectedBadge ? 'Update Badge' : 'Create Badge'}
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

        {/* Bulk Award Badge to Class Modal */}
        {showBulkAwardModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#173151]">Award Badge to Class</h2>
                  <p className="text-sm text-gray-500">Award to all enrolled students at once</p>
                </div>
              </div>

              <form onSubmit={handleSubmitBulkAward} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Badge <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bulkAwardData.badge_id}
                    onChange={(e) => setBulkAwardData({ ...bulkAwardData, badge_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    placeholder="Search classes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {classes.filter((c) =>
                      c.name?.toLowerCase().includes(classSearch.toLowerCase())
                    ).length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 text-center">No classes found</p>
                    ) : (
                      classes
                        .filter((c) => c.name?.toLowerCase().includes(classSearch.toLowerCase()))
                        .slice(0, 15)
                        .map((cls) => (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => setBulkAwardData({ ...bulkAwardData, class_id: cls.id })}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0 ${
                              bulkAwardData.class_id === cls.id ? 'bg-green-100' : ''
                            }`}
                          >
                            <span className="font-medium">{cls.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({cls.current_enrollment || 0} students)
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                </div>

                {bulkAwardData.class_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>
                        {classes.find((c) => c.id === bulkAwardData.class_id)?.current_enrollment || 0}
                      </strong>{' '}
                      students will receive this badge
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={bulkAwardData.notes}
                    onChange={(e) => setBulkAwardData({ ...bulkAwardData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    placeholder="Why is this badge being awarded to the class?"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowBulkAwardModal(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !bulkAwardData.badge_id || !bulkAwardData.class_id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin">&#x21bb;</span>
                        Awarding...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Award to All
                      </>
                    )}
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
