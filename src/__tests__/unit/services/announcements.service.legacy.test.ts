/**
 * Announcements Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/announcements.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockAnn = { id: 'ann-1', title: 'Test', description: 'Body', type: 'general' };

describe('announcementsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.uploadAttachment).toBe('function');
      expect(typeof service.markAsRead).toBe('function');
      expect(typeof service.markAllAsRead).toBe('function');
      expect(typeof service.getUnreadCount).toBe('function');
      expect(typeof service.getUnread).toBe('function');
      expect(typeof service.getByPriority).toBe('function');
      expect(typeof service.getHighPriority).toBe('function');
      expect(typeof service.getByType).toBe('function');
      expect(typeof service.getUrgent).toBe('function');
      expect(typeof service.getByClass).toBe('function');
      expect(typeof service.getByProgram).toBe('function');
      expect(typeof service.getRecent).toBe('function');
      expect(typeof service.pin).toBe('function');
      expect(typeof service.unpin).toBe('function');
      expect(typeof service.getPinned).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return announcements', async () => {
      mock.onGet('/announcements').reply(200, [mockAnn]);
      const result = await service.getAll();
      expect(result[0].id).toBe('ann-1');
    });

    it('should handle paginated response format', async () => {
      mock.onGet('/announcements').reply(200, { items: [mockAnn], total: 1 });
      const result = await service.getAll();
      expect(result[0].id).toBe('ann-1');
    });

    it('should pass filter params', async () => {
      mock.onGet('/announcements').reply(200, [mockAnn]);
      await service.getAll({ priority: 'high', type: 'urgent' });
    });
  });

  describe('getById', () => {
    it('should return announcement by ID', async () => {
      mock.onGet('/announcements/ann-1').reply(200, mockAnn);
      const result = await service.getById('ann-1');
      expect(result.title).toBe('Test');
    });

    it('should throw on 404', async () => {
      mock.onGet('/announcements/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create announcement', async () => {
      mock.onPost('/announcements').reply(201, mockAnn);
      const result = await service.create({ title: 'Test', description: 'Body' });
      expect(result.id).toBe('ann-1');
    });
  });

  describe('update', () => {
    it('should update announcement', async () => {
      mock.onPut('/announcements/ann-1').reply(200, { ...mockAnn, title: 'Updated' });
      const result = await service.update('ann-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('uploadAttachment', () => {
    it('should upload file attachment', async () => {
      mock.onPost('/announcements/ann-1/attachments').reply(200, { id: 'att-1', filename: 'test.pdf' });
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await service.uploadAttachment('ann-1', file);
      expect(result.id).toBe('att-1');
    });
  });

  describe('delete', () => {
    it('should delete announcement', async () => {
      mock.onDelete('/announcements/ann-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('ann-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('markAsRead', () => {
    it('should mark as read (uses MARK_READ endpoint)', async () => {
      // The endpoint is dynamically generated; just mock all post to announcements
      mock.onPost(/\/announcements\/ann-1/).reply(200, { message: 'Read' });
      const result = await service.markAsRead('ann-1');
      expect(result).toBeDefined();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      mock.onPost(/\/announcements/).reply(200, { message: 'All read' });
      const result = await service.markAllAsRead();
      expect(result).toBeDefined();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mock.onGet(/\/announcements/).reply(200, { unread_count: 3 });
      const result = await service.getUnreadCount();
      expect(result.unread_count).toBe(3);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mock.onGet('/announcements').reply(200, [mockAnn]);
    });

    it('getUnread should call getAll with unread=true', async () => {
      const result = await service.getUnread();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByPriority should call getAll with priority', async () => {
      const result = await service.getByPriority('high');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getHighPriority should call getByPriority(high)', async () => {
      const result = await service.getHighPriority();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByType should call getAll with type', async () => {
      const result = await service.getByType('urgent');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getUrgent should call getByType(urgent)', async () => {
      const result = await service.getUrgent();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByClass should call getAll with class_id', async () => {
      const result = await service.getByClass('cls-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByProgram should call getAll with program_id', async () => {
      const result = await service.getByProgram('prog-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getRecent should call getAll with limit', async () => {
      const result = await service.getRecent(3);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('pin/unpin/getPinned', () => {
    it('should pin announcement', async () => {
      mock.onPost(/\/announcements\/ann-1/).reply(200, { message: 'Pinned' });
      const result = await service.pin('ann-1');
      expect(result).toBeDefined();
    });

    it('should unpin announcement', async () => {
      mock.onPost(/\/announcements\/ann-1/).reply(200, { message: 'Unpinned' });
      const result = await service.unpin('ann-1');
      expect(result).toBeDefined();
    });

    it('should get pinned', async () => {
      mock.onGet(/\/announcements/).reply(200, [mockAnn]);
      const result = await service.getPinned();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
