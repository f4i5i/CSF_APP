/**
 * Announcement Service Unit Tests
 * Tests for announcement management service methods (TypeScript version)
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const announcementModule = require('../../../api/services/announcement.service');
const announcementService =
  announcementModule.announcementService ||
  announcementModule.default?.announcementService ||
  announcementModule.default;

const mock = new MockAdapter(apiClient);

const mockAnnouncement = {
  id: 'ann-1',
  title: 'School Event',
  content: 'School event this Friday',
  type: 'event',
  priority: 'high',
  is_published: true,
  is_pinned: false,
  class_id: null,
  program_id: null,
  author_name: 'Admin',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const mockUnreadCount = {
  unread_count: 5,
  by_priority: { high: 2, medium: 2, low: 1 },
  by_type: { urgent: 1, general: 3, event: 1 },
};

describe('announcementService', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // MODULE LOADING TEST
  // ===========================================
  describe('module loading', () => {
    it('should have announcementService defined with all methods', () => {
      expect(announcementService).toBeDefined();
      expect(typeof announcementService.getAll).toBe('function');
      expect(typeof announcementService.getById).toBe('function');
      expect(typeof announcementService.create).toBe('function');
      expect(typeof announcementService.update).toBe('function');
      expect(typeof announcementService.delete).toBe('function');
      expect(typeof announcementService.markAsRead).toBe('function');
      expect(typeof announcementService.markAllAsRead).toBe('function');
      expect(typeof announcementService.getUnreadCount).toBe('function');
      expect(typeof announcementService.getUnread).toBe('function');
      expect(typeof announcementService.getByPriority).toBe('function');
      expect(typeof announcementService.getHighPriority).toBe('function');
      expect(typeof announcementService.getByType).toBe('function');
      expect(typeof announcementService.getUrgent).toBe('function');
      expect(typeof announcementService.getByClass).toBe('function');
      expect(typeof announcementService.getByProgram).toBe('function');
      expect(typeof announcementService.getRecent).toBe('function');
      expect(typeof announcementService.pin).toBe('function');
      expect(typeof announcementService.unpin).toBe('function');
      expect(typeof announcementService.getPinned).toBe('function');
    });
  });

  // ===========================================
  // GET ALL
  // ===========================================
  describe('getAll', () => {
    it('should return all announcements', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('School Event');
    });

    it('should pass filter params', async () => {
      mock.onGet('/announcements').reply((config) => {
        expect(config.params).toEqual({ priority: 'high', type: 'event' });
        return [200, [mockAnnouncement]];
      });

      await announcementService.getAll({ priority: 'high', type: 'event' });
    });

    it('should return empty array', async () => {
      mock.onGet('/announcements').reply(200, []);

      const result = await announcementService.getAll();
      expect(result).toEqual([]);
    });

    it('should throw on 500', async () => {
      mock.onGet('/announcements').reply(500, { message: 'Server error' });

      await expect(announcementService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return announcement by ID', async () => {
      mock.onGet('/announcements/ann-1').reply(200, mockAnnouncement);

      const result = await announcementService.getById('ann-1');

      expect(result.id).toBe('ann-1');
      expect(result.title).toBe('School Event');
    });

    it('should throw on 404', async () => {
      mock.onGet('/announcements/bad-id').reply(404, { message: 'Not found' });

      await expect(announcementService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE
  // ===========================================
  describe('create', () => {
    it('should create announcement successfully', async () => {
      const newAnnouncement = {
        title: 'New Announcement',
        content: 'Content here',
        type: 'general',
        priority: 'medium',
        is_published: true,
      };

      mock.onPost('/announcements').reply(201, {
        id: 'ann-2',
        ...newAnnouncement,
        created_at: '2024-01-16T10:00:00Z',
      });

      const result = await announcementService.create(newAnnouncement);

      expect(result.id).toBe('ann-2');
      expect(result.title).toBe('New Announcement');
    });

    it('should throw on validation error', async () => {
      mock.onPost('/announcements').reply(400, { message: 'Title required' });

      await expect(
        announcementService.create({ content: 'no title' } as any)
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE
  // ===========================================
  describe('update', () => {
    it('should update announcement', async () => {
      const updated = { ...mockAnnouncement, title: 'Updated Title' };
      mock.onPut('/announcements/ann-1').reply(200, updated);

      const result = await announcementService.update('ann-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw on 404', async () => {
      mock.onPut('/announcements/bad-id').reply(404, { message: 'Not found' });

      await expect(
        announcementService.update('bad-id', { title: 'test' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // DELETE
  // ===========================================
  describe('delete', () => {
    it('should delete announcement', async () => {
      mock.onDelete('/announcements/ann-1').reply(200, { message: 'Deleted successfully' });

      const result = await announcementService.delete('ann-1');

      expect(result.message).toBe('Deleted successfully');
    });

    it('should throw on 404', async () => {
      mock.onDelete('/announcements/bad-id').reply(404, { message: 'Not found' });

      await expect(announcementService.delete('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // MARK AS READ
  // ===========================================
  describe('markAsRead', () => {
    it('should mark announcement as read', async () => {
      mock.onPost('/announcements/ann-1/read').reply(200, { message: 'Marked as read' });

      const result = await announcementService.markAsRead('ann-1');

      expect(result.message).toBe('Marked as read');
    });
  });

  // ===========================================
  // MARK ALL AS READ
  // ===========================================
  describe('markAllAsRead', () => {
    it('should mark all announcements as read', async () => {
      mock.onPost('/announcements/mark-all-read').reply(200, { message: 'All marked as read' });

      const result = await announcementService.markAllAsRead();

      expect(result.message).toBe('All marked as read');
    });
  });

  // ===========================================
  // GET UNREAD COUNT
  // ===========================================
  describe('getUnreadCount', () => {
    it('should return unread count with breakdown', async () => {
      mock.onGet('/announcements/unread/count').reply(200, mockUnreadCount);

      const result = await announcementService.getUnreadCount();

      expect(result.unread_count).toBe(5);
      expect(result.by_priority.high).toBe(2);
    });
  });

  // ===========================================
  // PIN / UNPIN
  // ===========================================
  describe('pin', () => {
    it('should pin an announcement', async () => {
      mock.onPost('/announcements/ann-1/pin').reply(200, { message: 'Pinned' });

      const result = await announcementService.pin('ann-1');

      expect(result.message).toBe('Pinned');
    });
  });

  describe('unpin', () => {
    it('should unpin an announcement', async () => {
      mock.onPost('/announcements/ann-1/unpin').reply(200, { message: 'Unpinned' });

      const result = await announcementService.unpin('ann-1');

      expect(result.message).toBe('Unpinned');
    });
  });

  describe('getPinned', () => {
    it('should return pinned announcements', async () => {
      const pinned = { ...mockAnnouncement, is_pinned: true };
      mock.onGet('/announcements/pinned').reply(200, [pinned]);

      const result = await announcementService.getPinned();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].is_pinned).toBe(true);
    });
  });

  // ===========================================
  // CONVENIENCE METHODS
  // ===========================================
  describe('getUnread', () => {
    it('should call getAll with unread filter', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getUnread();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByPriority', () => {
    it('should call getAll with priority filter', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getByPriority('high');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getHighPriority', () => {
    it('should call getByPriority with high', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getHighPriority();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should call getAll with class_id filter', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getByClass('class-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByProgram', () => {
    it('should call getAll with program_id filter', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getByProgram('program-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getRecent', () => {
    it('should call getAll with limit', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getRecent(10);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should default to 5 limit', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getRecent();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUrgent', () => {
    it('should call getByType with urgent', async () => {
      mock.onGet('/announcements').reply(200, [mockAnnouncement]);

      const result = await announcementService.getUrgent();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
