import { X, Upload } from "lucide-react";
import { useRef } from "react";

export default function UploadPhotosModal({ onClose }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-manrope font-semibold text-gray-800">Upload Photos</h2>
         <button onClick={onClose} className="border border-[#DFE1E7] rounded-full p-2">
              <X size={12} className="text-[#0D0D12] " />
            </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-6">

          {/* Photos Upload */}
          <div>
            <label className="block text-sm font-manrope font-medium text-gray-700 mb-2">
              Photos<span className="text-red-500">*</span>
            </label>

            <div
              onClick={handleUploadClick}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center py-10 cursor-pointer hover:border-gray-400 transition"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Upload className="text-gray-600" size={22} />
              </div>
              <p className="text-gray-600 font-manrope font-medium">Click to upload photos</p>
              <p className="text-xs font-manrope text-gray-500">PNG, JPG up to 10MB each</p>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
          </div>

          {/* Classes */}
          <div>
            <label className="block text-sm font-medium font-manrope text-gray-700 mb-2">
              Classes<span className="text-red-500">*</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {[
                "Everyone",
                "Morning Session",
                "Afternoon Session",
                "Evening Session",
                "Weekend Warriors",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 font-manrope bg-white border rounded-full text-sm text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border font-manrope text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="flex items-center font-manrope gap-2 px-6 py-2 rounded-full bg-[#E4AC37] hover:bg-[#d9a12f] text-black font-medium shadow">
            <Upload size={16} />
            Upload Photos
          </button>
        </div>
      </div>
    </div>
  );
}
