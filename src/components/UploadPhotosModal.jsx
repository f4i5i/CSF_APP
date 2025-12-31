import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation } from "../hooks";
import { photosService } from "../api/services";

export default function UploadPhotosModal({ onClose, onSuccess, classes = [], selectedClass }) {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState(
    selectedClass ? [selectedClass.id] : []
  );
  const [previews, setPreviews] = useState([]);

  // Upload mutation
  const { mutate: uploadPhotos, loading: uploading } = useMutation(
    async (data) => {
      // Upload photos one by one or in bulk
      if (data.files.length === 1) {
        return photosService.upload({
          file: data.files[0],
          class_id: data.class_ids[0],
        });
      } else {
        return photosService.bulkUpload({
          files: data.files,
          class_id: data.class_ids[0],
        });
      }
    },
    {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      },
    }
  );

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClassToggle = (classId) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    if (selectedClassIds.length === 0) return;

    try {
      await uploadPhotos({
        files: selectedFiles,
        class_ids: selectedClassIds,
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const isValid = selectedFiles.length > 0 && selectedClassIds.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full xxl:max-w-2xl max-w-[540px] rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E7] px-6 py-5">
          <h2 className="text-lg font-manrope text-nuetral-200 font-semibold">Upload Photos</h2>

          <button
            onClick={onClose}
            disabled={uploading}
            className="border border-[#DFE1E7] rounded-full w-10 h-10 flex items-center justify-center"
          >
            <X size={16} className="text-[#0D0D12] font-bold" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-6">

          {/* Photos Upload */}
          <div>
            <label className="block text-sm font-manrope font-normal text-text-muted opacity-70 mb-2">
              Photos<span className="text-red-800 ml-[2px]">*</span>
            </label>

            {/* Preview area or upload zone */}
            {selectedFiles.length > 0 ? (
              <div className="space-y-3">
                {/* Previews grid */}
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add more button */}
                <button
                  onClick={handleUploadClick}
                  className="w-full border-2 border-dashed border-border-light bg-card_bg h-12 rounded-xl flex justify-center items-center gap-2 cursor-pointer hover:border-gray-400 transition"
                >
                  <Upload className="text-text-muted" size={16} />
                  <span className="text-text-muted text-sm">Add more photos</span>
                </button>
              </div>
            ) : (
              <div
                onClick={handleUploadClick}
                className="w-full border-2 border-border-light bg-card_bg h-[150px] rounded-xl flex flex-col justify-center items-center py-4 cursor-pointer hover:border-gray-400 transition"
              >
                <div className="w-12 h-12 bg-border-light rounded-full flex items-center justify-center mb-2">
                  <Upload className="text-text-muted" size={24} />
                </div>
                <p className="text-nuetral-200 font-manrope text-lg mt-1 font-medium">Click to upload photos</p>
                <p className="text-[15px] font-manrope leading-6 font-light text-text-muted">PNG, JPG up to 10MB each</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </div>

          {/* Classes */}
          <div>
            <label className="block text-sm font-manrope font-normal text-text-muted opacity-70 mb-2">
              Classes<span className="text-red-800 ml-[2px]">*</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => handleClassToggle(classItem.id)}
                    className={`px-3 py-1.5 font-manrope leading-5 border rounded-xl text-sm shadow-sm cursor-pointer transition-colors ${
                      selectedClassIds.includes(classItem.id)
                        ? 'bg-[#1D3557] text-white border-[#1D3557]'
                        : 'bg-white border-border-light text-nuetral-200 hover:bg-gray-50'
                    }`}
                  >
                    {classItem.name}
                  </button>
                ))
              ) : (
                // Fallback options if no classes provided
                ["Everyone", "Morning Session", "Afternoon Session", "Evening Session", "Weekend Warriors"].map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 font-manrope border-border-light leading-5 bg-white border rounded-xl text-sm text-nuetral-200 shadow-sm cursor-pointer hover:bg-gray-50"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 border-t border-border-light px-6 py-4">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 rounded-full w-[128px] h-12 border border-border-light font-semibold text-base font-manrope text-nuetral-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValid || uploading}
            className="flex items-center justify-center font-manrope gap-2 w-[178px] h-12 px-6 py-2 rounded-full bg-[#F3BC48] hover:bg-[#d9a12f] text-black font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              'Upload Photos'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
