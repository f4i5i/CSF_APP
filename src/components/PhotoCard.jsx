import { Link } from 'react-router-dom';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { getFileUrl } from '../api/config';

const buildPhotoSrc = (photo) => {
  if (!photo) return '';

  const normalizeDataUrl = (data, mimeType) => {
    if (!data) return '';
    const trimmedData = data.trim();
    if (trimmedData.startsWith('data:')) return trimmedData;
    const type = mimeType || 'image/jpeg';
    return `data:${type};base64,${trimmedData}`;
  };

  const inlineBase64 =
    photo.image_base64 ||
    photo.imageBase64 ||
    photo.base64 ||
    photo.base64_data ||
    photo.image_data ||
    photo?.image?.base64 ||
    photo?.image?.base64_data ||
    photo?.image?.data;

  if (inlineBase64) {
    const mimeType =
      photo.mime_type ||
      photo.content_type ||
      photo?.image?.mime_type ||
      photo?.image?.content_type;
    return normalizeDataUrl(inlineBase64, mimeType);
  }

  // Get raw URL and convert to full URL using getFileUrl
  const rawUrl = (
    photo.url ||
    photo.image_url ||
    photo.thumbnail_url ||
    photo?.image?.url ||
    ''
  );

  return rawUrl ? getFileUrl(rawUrl) : '';
};

const CARD_BASE = 'w-full h-full max-sm:w-full';
const CARD_MIN_HEIGHT = 'min-h-[454px]';

const PhotoCard = ({ photos = [], loading = false }) => {
  const photoList = Array.isArray(photos)
    ? photos
    : Array.isArray(photos?.items)
    ? photos.items
    : Array.isArray(photos?.data)
    ? photos.data
    : Array.isArray(photos?.photos)
    ? photos.photos
    : Array.isArray(photos?.results)
    ? photos.results
    : [];

  // Loading state
  if (loading) {
    return (
      <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} rounded-[30px] bg-gray-200 animate-pulse`}></div>
    );
  }

  // Empty state - no photos
  if (!photoList || photoList.length === 0) {
    return (
      <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} rounded-[30px] bg-[#FFFFFF50] flex flex-col items-center justify-center text-gray-500`}>
        <ImageIcon className="w-16 h-16 mb-3 text-gray-300" />
        <p className="font-medium xxl1:text-xl">No photos yet</p>
        <p className="text-sm mt-1 xxl1:text-base">Check back later for photos</p>
      </div>
    );
  }

  // Show single large photo if only one
  if (photoList.length === 1) {
    const photo = photoList[0];
    const photoSrc = buildPhotoSrc(photo);
    return (
      <Link
        to="/photos"
        className={`block ${CARD_BASE} ${CARD_MIN_HEIGHT} rounded-[30px] bg-cover bg-center relative overflow-hidden group`}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={photo.caption || 'Program photo'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}

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
  const displayPhotos = photoList.slice(0, 6);
  const remaining = photoList.length > 6 ? photoList.length - 6 : 0;

  return (
    <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} rounded-[30px] bg-[#FFFFFF50] p-4 overflow-hidden`}>
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
              src={buildPhotoSrc(photo) || '/placeholder-photo.png'}
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
