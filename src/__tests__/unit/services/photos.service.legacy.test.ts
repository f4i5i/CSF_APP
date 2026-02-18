/**
 * Photos Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/photos.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockPhoto = { id: 'ph-1', url: 'https://cdn.example.com/1.jpg', caption: 'Game day' };
const mockAlbum = { id: 'alb-1', name: 'Summer 2024' };

describe('photosService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.upload).toBe('function');
      expect(typeof service.bulkUpload).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.getAlbums).toBe('function');
      expect(typeof service.createAlbum).toBe('function');
      expect(typeof service.getAlbumById).toBe('function');
      expect(typeof service.updateAlbum).toBe('function');
      expect(typeof service.deleteAlbum).toBe('function');
      expect(typeof service.tagChild).toBe('function');
      expect(typeof service.untagChild).toBe('function');
      expect(typeof service.getByChild).toBe('function');
      expect(typeof service.getByEvent).toBe('function');
      expect(typeof service.getByClass).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return photos (no class_id)', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await service.getAll();
      expect(result[0].id).toBe('ph-1');
    });

    it('should use class endpoint when class_id provided', async () => {
      mock.onGet('/photos/class/cls-1').reply(200, [mockPhoto]);
      const result = await service.getAll({ class_id: 'cls-1' });
      expect(result[0].id).toBe('ph-1');
    });

    it('should pass other filters', async () => {
      mock.onGet('/photos').reply(200, []);
      await service.getAll({ album_id: 'alb-1' });
    });
  });

  describe('getById', () => {
    it('should return photo by ID', async () => {
      mock.onGet('/photos/ph-1').reply(200, mockPhoto);
      const result = await service.getById('ph-1');
      expect(result.caption).toBe('Game day');
    });

    it('should throw on 404', async () => {
      mock.onGet('/photos/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload single photo with FormData', async () => {
      mock.onPost('/photos/upload').reply(201, mockPhoto);
      const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.upload({ file, caption: 'Test', class_id: 'cls-1' });
      expect(result.id).toBe('ph-1');
    });

    it('should support class_ids array', async () => {
      mock.onPost('/photos/upload').reply(201, mockPhoto);
      const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.upload({ file, class_ids: ['cls-1', 'cls-2'] });
      expect(result).toBeDefined();
    });

    it('should throw on 413', async () => {
      mock.onPost('/photos/upload').reply(413);
      const file = new File(['img'], 'huge.jpg', { type: 'image/jpeg' });
      await expect(service.upload({ file })).rejects.toThrow();
    });
  });

  describe('bulkUpload', () => {
    it('should bulk upload', async () => {
      mock.onPost('/photos/bulk').reply(200, { uploaded: 3, failed: 0 });
      const files = [
        new File(['1'], '1.jpg', { type: 'image/jpeg' }),
        new File(['2'], '2.jpg', { type: 'image/jpeg' }),
      ];
      const result = await service.bulkUpload({ files, album_id: 'alb-1' });
      expect(result.uploaded).toBe(3);
    });
  });

  describe('update', () => {
    it('should update photo', async () => {
      mock.onPut('/photos/ph-1').reply(200, { ...mockPhoto, caption: 'Updated' });
      const result = await service.update('ph-1', { caption: 'Updated' });
      expect(result.caption).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete photo', async () => {
      mock.onDelete('/photos/ph-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('ph-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('getAlbums', () => {
    it('should return albums/categories', async () => {
      mock.onGet('/photos/categories').reply(200, [mockAlbum]);
      const result = await service.getAlbums();
      expect(result[0].name).toBe('Summer 2024');
    });
  });

  describe('createAlbum', () => {
    it('should create album', async () => {
      mock.onPost('/photos/categories').reply(201, mockAlbum);
      const result = await service.createAlbum({ name: 'Summer 2024' });
      expect(result.id).toBe('alb-1');
    });
  });

  describe('getAlbumById', () => {
    it('should return album by ID', async () => {
      mock.onGet('/photos/categories/alb-1').reply(200, { ...mockAlbum, photos: [mockPhoto] });
      const result = await service.getAlbumById('alb-1');
      expect(result.photos.length).toBe(1);
    });
  });

  describe('updateAlbum', () => {
    it('should update album', async () => {
      mock.onPut('/photos/categories/alb-1').reply(200, { ...mockAlbum, name: 'Updated' });
      const result = await service.updateAlbum('alb-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album', async () => {
      mock.onDelete('/photos/categories/alb-1').reply(200, { message: 'Deleted' });
      const result = await service.deleteAlbum('alb-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('tagChild', () => {
    it('should tag child in photo', async () => {
      mock.onPost('/photos/ph-1/tag').reply(200, { message: 'Tagged' });
      const result = await service.tagChild('ph-1', 'ch-1');
      expect(result.message).toBe('Tagged');
    });
  });

  describe('untagChild', () => {
    it('should untag child', async () => {
      mock.onDelete('/photos/ph-1/tag/ch-1').reply(200, { message: 'Untagged' });
      const result = await service.untagChild('ph-1', 'ch-1');
      expect(result.message).toBe('Untagged');
    });
  });

  describe('getByChild', () => {
    it('should call getAll with child_id', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await service.getByChild('ch-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByEvent', () => {
    it('should call getAll with event_id', async () => {
      mock.onGet('/photos').reply(200, [mockPhoto]);
      const result = await service.getByEvent('ev-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should fetch photos for class', async () => {
      mock.onGet('/photos/class/cls-1').reply(200, [mockPhoto]);
      const result = await service.getByClass('cls-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass additional params', async () => {
      mock.onGet('/photos/class/cls-1').reply(200, [mockPhoto]);
      const result = await service.getByClass('cls-1', { limit: 5 });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
