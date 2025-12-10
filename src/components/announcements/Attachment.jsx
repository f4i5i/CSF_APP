import { X } from "lucide-react";

export default function Attachment({ file }) {
  // Determine file type and details
  const fileName = typeof file === 'string' ? file : file?.name || '';
  const fileUrl = typeof file === 'string' ? null : file?.url || file?.file_url || null;

  // Check if it's an image based on extension
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  // Determine variant: v1 for documents (PDF, etc.), v2 for images
  const variant = isImage ? 'v2' : 'v1';

  return (
    <div className="inline-flex items-center gap-fluid-2 bg-white/50 rounded-full px-fluid-4 pr-fluid-5 py-fluid-2 w-fit">
      {/* Thumbnail - either certificate icon or image */}
      <div className="flex items-center justify-center shrink-0 w-fluid-icon-sm h-fluid-icon-sm">
        {variant === 'v2' && fileUrl ? (
          // Image variant - show actual image thumbnail
          <div className="w-fluid-icon-sm h-fluid-icon-sm rounded-full overflow-hidden">
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          // PDF/Document variant - show certificate icon
          <div className="bg-[#f9efcd] rounded-fluid-lg w-fluid-icon-md h-fluid-icon-sm flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 8.33333V5C17.5 4.08 16.75 3.33333 15.8333 3.33333H4.16667C3.25 3.33333 2.5 4.08 2.5 5V15C2.5 15.92 3.25 16.6667 4.16667 16.6667H10"
                stroke="#FFC205"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.1667 18.3333L15.8333 16.6667L17.5 18.3333"
                stroke="#FFC205"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.8333 13.3333V16.6667"
                stroke="#FFC205"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Filename - font weight depends on variant */}
      <span
        className={`font-manrope text-fluid-base text-black opacity-70 leading-[1.6] shrink-0 ${
          variant === 'v1' ? 'font-bold' : 'font-medium'
        }`}
      >
        {fileName}
      </span>

      {/* Close button */}
      <div className="w-3 h-3 flex items-center justify-center shrink-0">
        <X size={12} className="text-[#8796AF] cursor-pointer" />
      </div>
    </div>
  );
}
