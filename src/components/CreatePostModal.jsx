import { X } from "lucide-react";
import { useState } from "react";

const CreatePostModal = ({ onClose }) => {
     const [fileName, setFileName] = useState("");

  // Trigger when file is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {/* Modal container */}
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-lg overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E7] px-7 py-6">
          <h2 className="text-lg font-manrope  text-nuetral-200 font-semibold">Create New Post</h2>

         <button onClick={onClose} className="border border-[#DFE1E7] rounded-full w-10 h-10 flex items-center justify-center">
              <X size={16} className="text-[#0D0D12] " />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="font-medium text-text-muted text-sm font-manrope">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 font-manrope  rounded-xl border focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-text-muted text-sm font-manrope">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full mt-1 px-4 py-2 font-manrope rounded-xl border focus:ring-2 focus:ring-black outline-none resize-none"
              maxLength={200}
            ></textarea>
            <p className="text-right text-xs text-[#A4ACB9]">0/200</p>
          </div>

         {/* Attachments */}
          <div>
            <label className="font-medium text-text-muted  text-sm font-manrope">
              Attachments <span className="text-red-500">*</span>
            </label>

            <div
              className="mt-2 border rounded-xl px-4 py-7 text-gray-500 text-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />

              {!fileName ? (
                <>
                  <p className="text-text-muted" >
                    Drag & Drop your files or{" "}
                    <label
                      htmlFor="fileInput"
                      className="text-black font-manrope font-medium  cursor-pointer"
                    >
                      Browse
                    </label>
                  </p>
                </>
              ) : (
                <p className="text-black font-manrope font-medium">{fileName}</p>
              )}
            </div>
          </div>

          {/* Classes */}
          <div>
            <label className="font-medium text-sm font-manrope text-text-muted ">
              Classes <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-wrap gap-2 mt-2">
              {["Everyone", "Morning Session", "Afternoon Session", "Evening Session", "Weekend Warriors"].map(
                (item) => (
                  <button
                    key={item}
                    className="px-4 py-1.5 font-manrope rounded-xl text-sm border border-border-light text-nuetral-200 hover:bg-gray-100"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border-light px-6 py-6 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 font-manrope w-[128px] h-12 rounded-full border border-border-light font-semibold text-[16px] text-nuetral-200 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button className="px-6 py-2  w-[128px] h-12 font-manrope rounded-full bg-btn-gold text-nuetral-200 text-[16px] font-semibold hover:bg-[#cf9800]">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
