/**
 * Unit Tests for Photo Hooks
 * Tests usePhotos, usePhotoGallery, usePhoto, useClassPhotos,
 * useUploadPhoto, useBulkUploadPhotos, useUpdatePhoto, useDeletePhoto, useTagChild,
 * useAlbums, useAlbum, useCreateAlbum, useUpdateAlbum, useDeleteAlbum
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { usePhotos, usePhotoGallery, usePhoto, useClassPhotos } from '../../../api/hooks/photos/usePhotos';
import { useUploadPhoto, useBulkUploadPhotos, useUpdatePhoto, useDeletePhoto, useTagChild } from '../../../api/hooks/photos/useUploadPhoto';
import { useAlbums, useAlbum, useCreateAlbum, useUpdateAlbum, useDeleteAlbum } from '../../../api/hooks/photos/useAlbums';

jest.mock('../../../api/services/photo.service', () => ({
  photoService: {
    getAll: jest.fn(),
    getPaginated: jest.fn(),
    getById: jest.fn(),
    getByClass: jest.fn(),
    upload: jest.fn(),
    bulkUpload: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    tagChild: jest.fn(),
    getAlbums: jest.fn(),
    getAlbumById: jest.fn(),
    createAlbum: jest.fn(),
    updateAlbum: jest.fn(),
    deleteAlbum: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { photoService } from '../../../api/services/photo.service';

const mockedService = photoService as jest.Mocked<typeof photoService>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('Photo Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // usePhotos
  // =========================================================================
  describe('usePhotos', () => {
    it('should fetch all photos', async () => {
      const mockPhotos = [{ id: 'photo-1', url: 'https://example.com/photo1.jpg' }];
      mockedService.getAll.mockResolvedValueOnce(mockPhotos as any);

      const { result } = renderHook(
        () => usePhotos({}),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPhotos);
    });

    it('should pass filters to the service', async () => {
      const filters = { class_id: 'class-1' };
      mockedService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => usePhotos({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledWith(filters));
    });
  });

  // =========================================================================
  // usePhotoGallery
  // =========================================================================
  describe('usePhotoGallery', () => {
    it('should fetch paginated photos', async () => {
      const mockGallery = { items: [], total: 0, page: 1, pages: 0 };
      mockedService.getPaginated.mockResolvedValueOnce(mockGallery as any);

      const { result } = renderHook(
        () => usePhotoGallery({}),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockGallery);
    });
  });

  // =========================================================================
  // usePhoto
  // =========================================================================
  describe('usePhoto', () => {
    it('should fetch a single photo by ID', async () => {
      const mockPhoto = { id: 'photo-1', url: 'https://example.com/photo1.jpg' };
      mockedService.getById.mockResolvedValueOnce(mockPhoto as any);

      const { result } = renderHook(
        () => usePhoto({ photoId: 'photo-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPhoto);
      expect(mockedService.getById).toHaveBeenCalledWith('photo-1');
    });

    it('should not fetch when photoId is empty', async () => {
      const { result } = renderHook(
        () => usePhoto({ photoId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useClassPhotos
  // =========================================================================
  describe('useClassPhotos', () => {
    it('should fetch photos for a class', async () => {
      mockedService.getByClass.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useClassPhotos({ classId: 'class-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getByClass).toHaveBeenCalledWith('class-1');
    });

    it('should not fetch when classId is empty', async () => {
      const { result } = renderHook(
        () => useClassPhotos({ classId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useUploadPhoto
  // =========================================================================
  describe('useUploadPhoto', () => {
    it('should upload a photo and show success toast', async () => {
      const uploaded = { id: 'photo-new', url: 'https://example.com/new.jpg' };
      mockedService.upload.mockResolvedValueOnce(uploaded as any);

      const { result } = renderHook(() => useUploadPhoto(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ file: new File([], 'test.jpg'), class_id: 'class-1' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.upload.mockRejectedValueOnce({ message: 'File too large' });

      const { result } = renderHook(() => useUploadPhoto(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ file: new File([], 'test.jpg') } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('File too large');
    });
  });

  // =========================================================================
  // useBulkUploadPhotos
  // =========================================================================
  describe('useBulkUploadPhotos', () => {
    it('should bulk upload photos and show success toast', async () => {
      const uploaded = { uploaded_count: 3, failed_count: 0 };
      mockedService.bulkUpload.mockResolvedValueOnce(uploaded as any);

      const { result } = renderHook(() => useBulkUploadPhotos(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ files: [], class_id: 'class-1' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useUpdatePhoto
  // =========================================================================
  describe('useUpdatePhoto', () => {
    it('should update a photo and show success toast', async () => {
      const updated = { id: 'photo-1', caption: 'Updated caption' };
      mockedService.update.mockResolvedValueOnce(updated as any);

      const { result } = renderHook(() => useUpdatePhoto(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'photo-1', data: { caption: 'Updated caption' } } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDeletePhoto
  // =========================================================================
  describe('useDeletePhoto', () => {
    it('should delete a photo and show success toast', async () => {
      mockedService.delete.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeletePhoto(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('photo-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.delete).toHaveBeenCalledWith('photo-1');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useTagChild
  // =========================================================================
  describe('useTagChild', () => {
    it('should tag a child in a photo and show success toast', async () => {
      mockedService.tagChild.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useTagChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ photoId: 'photo-1', childId: 'child-1' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.tagChild).toHaveBeenCalledWith('photo-1', 'child-1');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useAlbums
  // =========================================================================
  describe('useAlbums', () => {
    it('should fetch all albums', async () => {
      const mockAlbums = [{ id: 'album-1', name: 'Season 2025' }];
      mockedService.getAlbums.mockResolvedValueOnce(mockAlbums as any);

      const { result } = renderHook(() => useAlbums(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAlbums);
    });
  });

  // =========================================================================
  // useAlbum
  // =========================================================================
  describe('useAlbum', () => {
    it('should fetch a single album by ID', async () => {
      const mockAlbum = { id: 'album-1', name: 'Season 2025' };
      mockedService.getAlbumById.mockResolvedValueOnce(mockAlbum as any);

      const { result } = renderHook(
        () => useAlbum({ albumId: 'album-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAlbum);
      expect(mockedService.getAlbumById).toHaveBeenCalledWith('album-1');
    });

    it('should not fetch when albumId is empty', async () => {
      const { result } = renderHook(
        () => useAlbum({ albumId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useCreateAlbum
  // =========================================================================
  describe('useCreateAlbum', () => {
    it('should create an album and show success toast', async () => {
      const created = { id: 'album-new', name: 'New Album' };
      mockedService.createAlbum.mockResolvedValueOnce(created as any);

      const { result } = renderHook(() => useCreateAlbum(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ name: 'New Album', description: 'Test' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useUpdateAlbum
  // =========================================================================
  describe('useUpdateAlbum', () => {
    it('should update an album and show success toast', async () => {
      const updated = { id: 'album-1', name: 'Updated Album' };
      mockedService.updateAlbum.mockResolvedValueOnce(updated as any);

      const { result } = renderHook(() => useUpdateAlbum(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'album-1', data: { name: 'Updated Album' } } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDeleteAlbum
  // =========================================================================
  describe('useDeleteAlbum', () => {
    it('should delete an album and show success toast', async () => {
      mockedService.deleteAlbum.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeleteAlbum(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('album-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.deleteAlbum).toHaveBeenCalledWith('album-1');
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.deleteAlbum.mockRejectedValueOnce({ message: 'Album not empty' });

      const { result } = renderHook(() => useDeleteAlbum(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('album-1');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Album not empty');
    });
  });
});
