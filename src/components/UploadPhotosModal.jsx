import { X, Upload } from "lucide-react";
import { useRef } from "react";

export default function UploadPhotosModal({ onClose }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full xxl:max-w-2xl max-w-[540px] rounded-3xl shadow-xl  overflow-hidden">

{/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E7] px-6 py-5">
          <h2 className="text-lg font-manrope  text-nuetral-200 font-semibold">Upload Photos</h2>

          <button onClick={onClose} className="border border-[#DFE1E7] rounded-full w-10 h-10 flex items-center justify-center">
              <X size={16} className="text-[#0D0D12] font-bold " />
            </button>
        </div>

        {/* BODY */} 
        <div className="px-6 py-6 space-y-6">

          {/* Photos Upload */}
          <div>
            <label className="block text-sm font-manrope font-normal text-text-muted opacity-70 mb-2">
              Photos<span className="text-red-800 ml-[2px] ">*</span>
            </label>

            <div
              onClick={handleUploadClick}
              className="w-full border-2 border-border-light bg-card_bg h-[150px] rounded-xl flex flex-col justify-center items-center py-4 cursor-pointer hover:border-gray-400 transition"
            >
              <div className="w-12 h-12 bg-border-light rounded-full flex items-center justify-center mb-2">
                <Upload className="text-text-muted" size={24} />
              </div>
              <p className="text-nuetral-200 font-manrope text-lg mt-1 font-medium">Click to upload photos</p>
              <p className="text-[15px] font-manrope leading-6 font-light text-text-muted">PNG, JPG up to 10MB each</p>

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
            <label className="block text-sm font-manrope font-normal text-text-muted opacity-70 mb-2">
              Classes<span className="text-red-800 ml-[2px] ">*</span>
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
                  className="px-3 py-1.5 font-manrope border-border-light leading-5 bg-white border rounded-xl text-sm text-nuetral-200 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 border-t border-border-light px-6 py-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full w-[128px] h-12 border border-border-light font-semibold text-base font-manrope text-nuetral-200 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="flex items-center justify-center font-manrope gap-2 w-[178px] h-12 px-6 py-2 rounded-full bg-[#F3BC48] hover:bg-[#d9a12f] text-black font-semibold shadow">
            {/* <Upload size={16} /> */}
            Upload Photos
          </button>
        </div>
      </div>
    </div>
  );
}
