/**
 * Photos Management Page
 * Admin page for managing photo galleries and uploads
 */

import React, { useState, useEffect, useRef } from 'react';
import { Image, Upload, Trash2, FolderPlus, Check, X, Search, Filter } from 'lucide-react';
import Header from '../../components/Header';
import photosService from '../../api/services/photos.service';
import classesService from '../../api/services/classes.service';
import toast from 'react-hot-toast';

export default function PhotosManagement() {
  const [photos, setPhotos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    files: [],
    class_id: '',
    caption: '',
  });
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPhotos();
    fetchClasses();
    fetchCategories();
  }, [classFilter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let response;
      if (classFilter) {
        response = await photosService.getByClass(classFilter);
      } else {
        // Fetch recent photos across all classes
        response = await photosService.getAll({ limit: 50 });
      }
      setPhotos(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos');
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

  const fetchCategories = async () => {
    try {
      const response = await photosService.getAlbums();
      setCategories(response.items || response || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadData({ ...uploadData, files });
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (uploadData.files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = uploadData.files.map((file) =>
        photosService.upload({
          file,
          class_id: uploadData.class_id || undefined,
          caption: uploadData.caption || undefined,
        })
      );

      await Promise.all(uploadPromises);
      toast.success(`${uploadData.files.length} photo(s) uploaded successfully`);
      setShowUploadModal(false);
      setUploadData({ files: [], class_id: '', caption: '' });
      fetchPhotos();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryData.name) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      await photosService.createAlbum(categoryData);
      toast.success('Category created successfully');
      setShowCategoryModal(false);
      setCategoryData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.response?.data?.detail || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(filteredPhotos.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(selectedPhotos.map((id) => photosService.delete(id)));
      toast.success(`${selectedPhotos.length} photo(s) deleted`);
      setShowDeleteModal(false);
      setSelectedPhotos([]);
      fetchPhotos();
    } catch (error) {
      console.error('Failed to delete photos:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete photos');
    } finally {
      setSaving(false);
    }
  };

  // Filter photos by search query
  const filteredPhotos = photos.filter((p) =>
    `${p.caption || ''} ${p.class_name || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Photos Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Upload and manage class photos
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#173151] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                New Category
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                />
              </div>
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedPhotos.length} selected
                </span>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPhotos([])}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {filteredPhotos.length > 0 && (
              <button
                onClick={selectAllPhotos}
                className="text-sm text-[#173151] hover:underline"
              >
                {selectedPhotos.length === filteredPhotos.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Categories Quick Access */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Photos Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-gold"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No photos found</h3>
            <p className="text-gray-500 mb-4">Upload photos to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a]"
            >
              Upload Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                  selectedPhotos.includes(photo.id)
                    ? 'border-[#F3BC48]'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <img
                  src={photo.url || photo.thumbnail_url || '/images/placeholder.jpg'}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover"
                />

                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedPhotos.includes(photo.id)
                      ? 'bg-[#F3BC48]'
                      : 'bg-white/80 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedPhotos.includes(photo.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Caption Overlay */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                  </div>
                )}

                {/* Class Badge */}
                {photo.class_name && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                    {photo.class_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-[#173151] mb-4">
                Upload Photos
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadData.files.length} file(s) selected
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-[#F3BC48] hover:underline mt-2"
                  >
                    Change files
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class (optional)
                  </label>
                  <select
                    value={uploadData.class_id}
                    onChange={(e) => setUploadData({ ...uploadData, class_id: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={uploadData.caption}
                    onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="Photo caption"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadData({ files: [], class_id: '', caption: '' });
                    }}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-[#F3BC48] text-[#173151] rounded-lg font-semibold hover:bg-[#e5ae3a] disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-[#173151] mb-4">
                Create Category
              </h2>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryData.name}
                    onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={categoryData.description}
                    onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] resize-none"
                    placeholder="Category description"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
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
                    {saving ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Delete Photos</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedPhotos.length} photo(s)? This action cannot be undone.
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
                  onClick={handleBulkDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Photos'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
