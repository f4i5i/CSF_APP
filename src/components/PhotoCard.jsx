import { Link } from 'react-router-dom';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const PhotoCard = ({ photos = [], loading = false }) => {
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[419px] max-xxl1:h-[250px] max-sm:h-[300px] rounded-[30px] bg-gray-200 animate-pulse"></div>
    );
  }

  // Empty state - no photos
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-[419px] max-xxl1:h-[250px] rounded-[30px] bg-[#FFFFFF50] flex flex-col items-center justify-center text-gray-500">
        <ImageIcon className="w-16 h-16 mb-3 text-gray-300" />
        <p className="font-medium xxl1:text-xl">No photos yet</p>
        <p className="text-sm mt-1 xxl1:text-base">Check back later for photos</p>
      </div>
    );
  }

  // Show single large photo if only one
  if (photos.length === 1) {
    const photo = photos[0];
    return (
      <Link
        to="/photos"
        className="block w-full h-[419px] max-xxl1:h-[250px] max-sm:h-[300px] rounded-[30px] bg-cover bg-center relative overflow-hidden group"
        style={{
          backgroundImage: `url(${photo.url || photo.image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>

        <div className="absolute top-4 right-4">
          <div className="bg-[#FFFFFF80] w-[62px] h-[62px] rounded-full flex justify-center items-center group-hover:bg-white transition">
            <ArrowUpRight className="w-7 h-7 text-gray-800" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold font-manrope text-xl">Program Photos</h3>
          <p className="text-lg font-normal font-manrope text-[#FFFFFFB8]">
            {photo.uploaded_at
              ? new Date(photo.uploaded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent'}
          </p>
        </div>
      </Link>
    );
  }

  // Grid view for multiple photos
  const displayPhotos = photos.slice(0, 6);
  const remaining = photos.length > 6 ? photos.length - 6 : 0;

  return (
    <div className="w-full h-[419px] max-xxl1:h-[250px] max-sm:h-[300px] rounded-[30px] bg-[#FFFFFF50] p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold font-manrope text-xl">Program Photos</h3>
        <Link
          to="/photos"
          className="bg-[#FFFFFF80] w-[48px] h-[48px] rounded-full flex justify-center items-center hover:bg-white transition"
        >
          <ArrowUpRight className="w-5 h-5 text-gray-800" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 h-[calc(100%-60px)]">
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="relative rounded-lg overflow-hidden bg-gray-200 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => window.location.href = '/photos'}
          >
            <img
              src={photo.url || photo.image_url}
              alt={photo.caption || 'Program photo'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-photo.png';
              }}
            />

            {/* Last item - show remaining count */}
            {index === 5 && remaining > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{remaining}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoCard;
