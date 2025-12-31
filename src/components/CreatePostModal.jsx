import { X, Paperclip, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { announcementsService } from "../api/services";

/**
 * CreatePostModal - Create or edit announcement/post for coach
 * @param {Function} onClose - Close modal callback
 * @param {Function} onSuccess - Success callback after creating/updating post
 * @param {Array} classes - Array of classes from coach's assigned classes
 * @param {Object} selectedClass - Currently selected class (pre-selected)
 * @param {Object} announcement - Announcement to edit (null for create mode)
 */
const CreatePostModal = ({ onClose, onSuccess, classes = [], selectedClass = null, announcement = null }) => {
  // Edit mode detection
  const isEditMode = !!announcement;

  // Form state - pre-populate if editing
  const [title, setTitle] = useState(announcement?.title || "");
  const [description, setDescription] = useState(announcement?.content || announcement?.description || "");
  const [selectedClassIds, setSelectedClassIds] = useState(() => {
    if (announcement?.class_ids) {
      return announcement.class_ids;
    }
    if (announcement?.class_id) {
      return [announcement.class_id];
    }
    if (selectedClass) {
      return [selectedClass.id];
    }
    return [];
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  // Clear selected file
  const handleClearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileName("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      setFile(droppedFile);
    }
  };

  // Toggle class selection
  const toggleClassSelection = (classId) => {
    setSelectedClassIds((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId);
      }
      return [...prev, classId];
    });
  };

  // Select all classes
  const selectAllClasses = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map((c) => c.id));
    }
  };

  // Validate form
  const isValid = title.trim() && description.trim() && selectedClassIds.length > 0;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        class_ids: selectedClassIds,
        type: "general",
      };

      let createdAnnouncement;

      if (isEditMode) {
        // Update existing announcement
        await announcementsService.update(announcement.id, {
          title: payload.title,
          description: payload.description,
          type: payload.type,
        });

        // Upload attachment if there's a new file
        if (file) {
          await announcementsService.uploadAttachment(announcement.id, file);
        }

        toast.success("Announcement updated successfully!");
      } else {
        // Create new announcement
        createdAnnouncement = await announcementsService.create(payload);

        // Upload attachment if there's a file
        if (file && createdAnnouncement?.id) {
          await announcementsService.uploadAttachment(createdAnnouncement.id, file);
        }

        toast.success("Announcement created successfully!");
      }

      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} announcement:`, error);
      toast.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} announcement`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {/* Modal container */}
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E7] px-7 py-6">
          <h2 className="text-lg font-manrope text-nuetral-200 font-semibold">
            {isEditMode ? "Edit Post" : "Create New Post"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="border border-[#DFE1E7] rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"
          >
            <X size={16} className="text-[#0D0D12]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="font-medium text-text-muted text-sm font-manrope">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full mt-1 px-4 py-2 font-manrope rounded-xl border focus:ring-2 focus:ring-black outline-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-medium text-text-muted text-sm font-manrope">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Enter announcement description"
                className="w-full mt-1 px-4 py-2 font-manrope rounded-xl border focus:ring-2 focus:ring-black outline-none resize-none"
                maxLength={200}
                disabled={isSubmitting}
              />
              <p className="text-right text-xs text-[#A4ACB9]">
                {description.length}/200
              </p>
            </div>

            {/* Attachments */}
            <div>
              <p className="font-medium text-text-muted text-sm font-manrope">
                Attachments
              </p>

              <label
                htmlFor="postFileInput"
                className="mt-2 border border-dashed rounded-xl px-4 py-7 text-gray-500 text-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition block"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="postFileInput"
                  accept="image/*,.pdf,.doc,.docx"
                  disabled={isSubmitting}
                />

                {!fileName ? (
                  <p className="text-text-muted pointer-events-none">
                    Drag & Drop your files or{" "}
                    <span className="text-black font-manrope font-medium underline">
                      Browse
                    </span>
                  </p>
                ) : (
                  <div className="flex items-center gap-3">
                    <Paperclip size={16} className="text-gray-500" />
                    <p className="text-black font-manrope font-medium">{fileName}</p>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="ml-2 p-1 hover:bg-gray-200 rounded-full transition"
                      title="Remove file"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                )}
              </label>
            </div>

            {/* Classes */}
            <div>
              <label className="font-medium text-sm font-manrope text-text-muted">
                Classes <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap gap-2 mt-2">
                {/* Select All button */}
                {classes.length > 1 && (
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    disabled={isSubmitting}
                    className={`px-4 py-1.5 font-manrope rounded-xl text-sm border transition ${
                      selectedClassIds.length === classes.length
                        ? "bg-[#1D3557] text-white border-[#1D3557]"
                        : "border-border-light text-nuetral-200 hover:bg-gray-100"
                    }`}
                  >
                    All Classes
                  </button>
                )}

                {/* Class buttons */}
                {classes.length > 0 ? (
                  classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      type="button"
                      onClick={() => toggleClassSelection(classItem.id)}
                      disabled={isSubmitting}
                      className={`px-4 py-1.5 font-manrope rounded-xl text-sm border transition ${
                        selectedClassIds.includes(classItem.id)
                          ? "bg-[#1D3557] text-white border-[#1D3557]"
                          : "border-border-light text-nuetral-200 hover:bg-gray-100"
                      }`}
                    >
                      {classItem.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No classes available</p>
                )}
              </div>

              {selectedClassIds.length === 0 && (
                <p className="text-red-500 text-xs mt-1">
                  Please select at least one class
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border-light px-6 py-6 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 font-manrope w-[128px] h-12 rounded-full border border-border-light font-semibold text-[16px] text-nuetral-200 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-6 py-2 w-[128px] h-12 font-manrope rounded-full bg-btn-gold text-nuetral-200 text-[16px] font-semibold hover:bg-[#cf9800] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                isEditMode ? "Update" : "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
