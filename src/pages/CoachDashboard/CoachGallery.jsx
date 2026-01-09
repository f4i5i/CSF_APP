import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Upload, Image as ImageIcon } from 'lucide-react';
import UploadPhotosModal from '../../components/UploadPhotosModal';

// Context & Hooks
import { useAuth } from '../../context/auth';
import { useApi } from '../../hooks';

// Services
import { classesService, photosService } from '../../api/services';
import { getFileUrl } from '../../api/config';

const CoachGallery = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================

  // Fetch coach's assigned classes
  const { data: classesData, loading: loadingClasses } = useApi(
    () => classesService.getAll({ coach_id: user?.id }),
    {
      initialData: { items: [] },
      dependencies: [user?.id],
      autoFetch: !!user?.id,
    }
  );

  // Extract classes array
  const classes = useMemo(() => {
    if (Array.isArray(classesData)) return classesData;
    return classesData?.items || [];
  }, [classesData]);

  // Set first class as default when classes load
  useMemo(() => {
    if (classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  // Fetch photos for selected class
  const { data: photosData, loading: loadingPhotos, refetch: refetchPhotos } = useApi(
    () => photosService.getByClass(selectedClass?.id),
    {
      initialData: [],
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
    }
  );

  // Extract photos array
  const photos = useMemo(() => {
    if (Array.isArray(photosData)) return photosData;
    return photosData?.items || photosData?.photos || [];
  }, [photosData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleUploadSuccess = () => {
    refetchPhotos();
    setOpen(false);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Distribute photos into 3 columns for masonry layout
  const getColumnPhotos = () => {
    const columns = [[], [], []];
    photos.forEach((photo, index) => {
      columns[index % 3].push(photo);
    });
    return columns;
  };

  const columnPhotos = getColumnPhotos();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen max-sm:h-fit bg-page-gradient max-sm:pb-20">
      <Header />

      <main className="px-6 py-8 max-xxl:py-5 max-sm:py-4 max-sm:px-3">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em]">
            Photo Gallery
          </h1>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2
              bg-[#F3BC48] hover:bg-[#d9a12f]
              text-black font-semibold font-['inter']
              py-2 rounded-[60px] shadow
              transition text-base w-[178px] h-12 text-center"
          >
            <Upload size={16} />
            Upload Photos
          </button>
        </div>

        {/* Class Filter Tabs */}
        {classes.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {classes.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => setSelectedClass(classItem)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedClass?.id === classItem.id
                    ? 'bg-[#1D3557] text-white'
                    : 'bg-white/50 text-[#1D3557] hover:bg-white/70'
                }`}
              >
                {classItem.name}
              </button>
            ))}
          </div>
        )}

        {/* Photo Gallery */}
        {loadingPhotos ? (
          // Loading skeleton
          <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
            {[1, 2, 3].map((col) => (
              <div key={col} className="flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="w-full h-48 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1D3557] mb-2">No photos yet</h3>
            <p className="text-gray-500 mb-4">Upload photos to share with your class</p>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-[#F3BC48] hover:bg-[#d9a12f] text-black font-semibold px-6 py-3 rounded-full"
            >
              <Upload size={16} />
              Upload Photos
            </button>
          </div>
        ) : (
          // Photo grid (masonry layout)
          <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
            {columnPhotos.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {column.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={getFileUrl(photo.image_url || photo.thumbnail_url || photo.url)}
                      alt={photo.caption || 'Class photo'}
                      className="w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {open && (
        <UploadPhotosModal
          onClose={() => setOpen(false)}
          onSuccess={handleUploadSuccess}
          classes={classes}
          selectedClass={selectedClass}
        />
      )}

      <Footer isFixed={true} />
    </div>
  );
};

export default CoachGallery;
