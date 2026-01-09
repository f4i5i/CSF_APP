import React, { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Hooks
import { useChildren, useApi } from '../hooks';

// Services
import { photosService, enrollmentsService } from '../api/services';
import { getFileUrl } from '../api/config';

// Optimized image component with lazy loading and placeholder
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative bg-gray-200 rounded-xl overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-sm">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

const Gallery = () => {
  // Get selected child from context
  const { children, selectedChild, selectChild, loading: loadingChildren } = useChildren();

  // Get first active enrollment for the selected child
  const { data: enrollmentsData, error: enrollmentsError } = useApi(
    () => enrollmentsService.getMy({
      child_id: selectedChild?.id,
      status: 'active',
    }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !!selectedChild?.id,
      onError: (err) => console.error('Failed to load enrollments:', err),
    }
  );

  // Derive class ID from enrollment
  const derivedClassId = useMemo(() => {
    if (!enrollmentsData || enrollmentsData.length === 0) return null;
    const enrollment = enrollmentsData.find(e => e.child_id === selectedChild?.id) || enrollmentsData[0];
    return enrollment?.class?.id || enrollment?.class_id || null;
  }, [enrollmentsData, selectedChild?.id]);

  // Fetch photos for the class
  const { data: photosData, loading: loadingPhotos, error: photosError } = useApi(
    () => photosService.getByClass(derivedClassId, { limit: 20 }),
    {
      initialData: [],
      dependencies: [derivedClassId],
      autoFetch: !!derivedClassId,
      onError: (err) => console.error('Failed to load photos:', err),
    }
  );

  // Combined error state
  const hasError = enrollmentsError || photosError;

  // Get photos array from API response - prioritize thumbnails for faster loading
  const photos = useMemo(() => {
    if (!photosData) return [];
    // Handle both array and paginated response
    const photoArray = Array.isArray(photosData) ? photosData : (photosData.items || []);
    return photoArray
      .map(photo => {
        // Prefer thumbnail for gallery grid (faster loading), fallback to full image
        const thumbnailUrl = photo.thumbnail_url || photo.url || photo.image_url;
        const fullUrl = photo.image_url || photo.url || photo.thumbnail_url;
        return {
          thumbnail: thumbnailUrl ? getFileUrl(thumbnailUrl) : null,
          full: fullUrl ? getFileUrl(fullUrl) : null,
          id: photo.id,
        };
      })
      .filter(p => p.thumbnail || p.full);
  }, [photosData]);

  // Split photos into 3 columns for masonry layout
  const columns = useMemo(() => {
    const col1 = [];
    const col2 = [];
    const col3 = [];
    photos.forEach((photo, index) => {
      if (index % 3 === 0) col1.push(photo);
      else if (index % 3 === 1) col2.push(photo);
      else col3.push(photo);
    });
    return [col1, col2, col3];
  }, [photos]);

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <main className="mx-6 py-8 max-sm:py-2 max-sm:mx-3">
        {/* Header with title and child selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-[32px] max-lg:text-[28px] font-manrope font-bold text-[#173151]">
            Photo Gallery
          </h1>

          {/* Child Selector */}
          {!loadingChildren && children.length > 0 && (
            <div className="relative">
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value);
                  if (child) selectChild(child);
                }}
                className="appearance-none bg-white/70 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm font-medium font-manrope text-[#173151] cursor-pointer focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {`${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Child'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {hasError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-manrope">
            <p className="font-medium">Unable to load photos</p>
            <p className="text-sm mt-1">Please try refreshing the page or check back later.</p>
          </div>
        )}

        {loadingPhotos ? (
          // Loading skeleton
          <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
            {[0, 1, 2].map((col) => (
              <div key={col} className="flex flex-col gap-4">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="w-full h-48 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {column.map((photo, imgIndex) => (
                  <LazyImage
                    key={photo.id || imgIndex}
                    src={photo.thumbnail || photo.full}
                    alt={`Gallery photo ${colIndex * 3 + imgIndex + 1}`}
                    className="w-full min-h-[150px]"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No photos available yet</p>
            <p className="text-sm mt-2">Photos from your child's activities will appear here</p>
          </div>
        )}
      </main>
      <Footer isFixed={true} />
    </div>
  )
}

export default Gallery