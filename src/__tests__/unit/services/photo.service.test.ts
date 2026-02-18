/**
 * Photo Service Unit Tests (TypeScript version)
 * Tests for photo gallery, albums, and tagging
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const photoModule = require('../../../api/services/photo.service');
const photoService =
  photoModule.photoService ||
  photoModule.default?.photoService ||
  photoModule.default;

const mock = new MockAdapter(apiClient);

const mockPhoto = {
  id: 'photo-1',
  url: 'https://cdn.example.com/photos/1.jpg',
  thumbnail_url: 'https://cdn.example.com/photos/1_thumb.jpg',
  caption: 'Summer camp activities',
  album_id: 'album-1',
  class_id: 'class-1',
  created_at: '2024-06-15T10:00:00Z',
};

const mockAlbum = {
  id: 'album-1',
  name: 'Summer Camp 2024',
  description: 'Photos from summer camp',
  photo_count: 15,
  created_at: '2024-06-01T00:00:00Z',
};

const mockAlbumWithPhotos = {
  ...mockAlbum,
  photos: [mockPhoto],
};

const mockGalleryResponse = {
  photos: [mockPhoto],
  total_count: 50,
  has_more: true,
  next_offset: 20,
};

const mockBulkUploadResponse = {
  success: true,
  uploaded_count: 3,
  failed_count: 0,
  photos: [mockPhoto],
};

describe('photoService (TypeScript)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // MODULE LOADING
  // ===========================================
  describe('module loading', () => {
    it('should have photoService defined with all methods', () => {
      expect(photoService).toBeDefined();
      expect(typeof photoService.getAll).toBe('function');
      expect(typeof photoService.getPaginated).toBe('function');
      expect(typeof photoService.getById).toBe('function');
      expect(typeof photoService.upload).toBe('function');
      expect(typeof photoService.bulkUpload).toBe('function');
      expect(typeof photoService.update).toBe('function');
      expect(typeof photoService.delete).toBe('function');
      expect(typeof photoService.getAlbums).toBe('function');
      expect(typeof photoService.createAlbum).toBe('function');
      expect(typeof photoService.getAlbumById).toBe('function');
      expect(typeof photoService.updateAlbum).toBe('function');
      expect(typeof photoService.deleteAlbum).toBe('function');
      expect(typeof photoService.tagChild).toBe('function');
      expect(typeof photoService.untagChild).toBe('function');
      expect(typeof photoService.getByChild).toBe('function');
      expect(typeof photoService.getByEvent).toBe('function');
      expect(typeof photoService.getByClass).toBe('function');
    });
  });

  // ===========================================
  // GET ALL PHOTOS
  // ===========================================
  describe('getAll', () => {
    it('should return all photos', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await photoService.getAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].caption).toBe('Summer camp activities');
    });

    it('should pass filter params', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      await photoService.getAll({ album_id: 'album-1' });
    });

    it('should throw on 500', async () => {
      mock.onGet('/photos').reply(500, { message: 'Server error' });
      await expect(photoService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET PAGINATED
  // ===========================================
  describe('getPaginated', () => {
    it('should return paginated gallery', async () => {
      mock.onGet('/photos/gallery').reply(200, mockGalleryResponse);
      const result = await photoService.getPaginated({ limit: 20, offset: 0 });
      expect(result.total_count).toBe(50);
      expect(result.has_more).toBe(true);
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return photo by ID', async () => {
      mock.onGet('/photos/photo-1').reply(200, mockPhoto);
      const result = await photoService.getById('photo-1');
      expect(result.id).toBe('photo-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/photos/bad-id').reply(404, { message: 'Not found' });
      await expect(photoService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // UPLOAD
  // ===========================================
  describe('upload', () => {
    it('should upload a photo', async () => {
      mock.onPost('/photos/upload').reply(201, { id: 'photo-new', ...mockPhoto });
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await photoService.upload({ file, caption: 'Test photo' });
      expect(result.id).toBe('photo-new');
    });

    it('should upload with all metadata', async () => {
      mock.onPost('/photos/upload').reply(201, mockPhoto);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await photoService.upload({
        file,
        album_id: 'album-1',
        event_id: 'event-1',
        class_id: 'class-1',
        caption: 'Test',
        child_ids: ['child-1'],
        taken_at: '2024-06-15T10:00:00Z',
      });
      expect(result).toBeDefined();
    });

    it('should throw on 413', async () => {
      mock.onPost('/photos/upload').reply(413, { message: 'File too large' });
      const file = new File(['test'], 'huge.jpg', { type: 'image/jpeg' });
      await expect(photoService.upload({ file })).rejects.toThrow();
    });
  });

  // ===========================================
  // BULK UPLOAD
  // ===========================================
  describe('bulkUpload', () => {
    it('should bulk upload photos', async () => {
      mock.onPost('/photos/bulk-upload').reply(200, mockBulkUploadResponse);
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const result = await photoService.bulkUpload({ files, album_id: 'album-1' });
      expect(result.uploaded_count).toBe(3);
      expect(result.success).toBe(true);
    });
  });

  // ===========================================
  // UPDATE
  // ===========================================
  describe('update', () => {
    it('should update photo', async () => {
      const updated = { ...mockPhoto, caption: 'Updated caption' };
      mock.onPut('/photos/photo-1').reply(200, updated);
      const result = await photoService.update('photo-1', { caption: 'Updated caption' });
      expect(result.caption).toBe('Updated caption');
    });
  });

  // ===========================================
  // DELETE
  // ===========================================
  describe('delete', () => {
    it('should delete photo', async () => {
      mock.onDelete('/photos/photo-1').reply(200, { message: 'Photo deleted successfully' });
      const result = await photoService.delete('photo-1');
      expect(result.message).toBe('Photo deleted successfully');
    });
  });

  // ===========================================
  // ALBUM CRUD
  // ===========================================
  describe('getAlbums', () => {
    it('should return albums', async () => {
      mock.onGet('/photos/albums').reply(200, [mockAlbum]);
      const result = await photoService.getAlbums();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('Summer Camp 2024');
    });
  });

  describe('createAlbum', () => {
    it('should create album', async () => {
      mock.onPost('/photos/albums').reply(201, mockAlbum);
      const result = await photoService.createAlbum({ name: 'Summer Camp 2024' });
      expect(result.id).toBe('album-1');
    });
  });

  describe('getAlbumById', () => {
    it('should return album with photos', async () => {
      mock.onGet('/photos/albums/album-1').reply(200, mockAlbumWithPhotos);
      const result = await photoService.getAlbumById('album-1');
      expect(result.name).toBe('Summer Camp 2024');
      expect(result.photos.length).toBe(1);
    });
  });

  describe('updateAlbum', () => {
    it('should update album', async () => {
      const updated = { ...mockAlbum, name: 'Updated Album' };
      mock.onPut('/photos/albums/album-1').reply(200, updated);
      const result = await photoService.updateAlbum('album-1', { name: 'Updated Album' });
      expect(result.name).toBe('Updated Album');
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album', async () => {
      mock.onDelete('/photos/albums/album-1').reply(200, { message: 'Album deleted' });
      const result = await photoService.deleteAlbum('album-1');
      expect(result.message).toBe('Album deleted');
    });
  });

  // ===========================================
  // TAGGING
  // ===========================================
  describe('tagChild', () => {
    it('should tag child in photo', async () => {
      mock.onPost('/photos/photo-1/tag-child').reply(200, { message: 'Child tagged successfully' });
      const result = await photoService.tagChild('photo-1', 'child-1');
      expect(result.message).toBe('Child tagged successfully');
    });
  });

  describe('untagChild', () => {
    it('should untag child from photo', async () => {
      mock.onDelete('/photos/photo-1/untag-child/child-1').reply(200, { message: 'Child untagged' });
      const result = await photoService.untagChild('photo-1', 'child-1');
      expect(result.message).toBe('Child untagged');
    });
  });

  // ===========================================
  // CONVENIENCE METHODS
  // ===========================================
  describe('getByChild', () => {
    it('should return photos for a child', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await photoService.getByChild('child-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByEvent', () => {
    it('should return photos for an event', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await photoService.getByEvent('event-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should return photos for a class', async () => {
      mock.onGet('/photos/class/class-1').reply(200, [mockPhoto]);
      const result = await photoService.getByClass('class-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass additional params', async () => {
      mock.onGet('/photos/class/class-1').reply(200, [mockPhoto]);
      const result = await photoService.getByClass('class-1', { limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
