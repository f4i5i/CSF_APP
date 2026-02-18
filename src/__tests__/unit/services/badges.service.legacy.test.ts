/**
 * Badges Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/badges.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockBadge = { id: 'b-1', name: 'Star Player', category: 'skill' };
const mockAward = { id: 'aw-1', badge_id: 'b-1', child_id: 'ch-1' };

describe('badgesService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.getByChild).toBe('function');
      expect(typeof service.getByEnrollment).toBe('function');
      expect(typeof service.getMyChildrenBadges).toBe('function');
      expect(typeof service.awardBadge).toBe('function');
      expect(typeof service.awardBadgeToClass).toBe('function');
      expect(typeof service.revokeBadge).toBe('function');
      expect(typeof service.getLeaderboard).toBe('function');
      expect(typeof service.getStats).toBe('function');
      expect(typeof service.checkEligibility).toBe('function');
      expect(typeof service.getByCategory).toBe('function');
      expect(typeof service.getRecentAwards).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return badges', async () => {
      mock.onGet('/badges').reply(200, [mockBadge]);
      const result = await service.getAll();
      expect(result[0].name).toBe('Star Player');
    });

    it('should pass filters', async () => {
      mock.onGet('/badges').reply(200, [mockBadge]);
      await service.getAll({ category: 'skill' });
    });
  });

  describe('getById', () => {
    it('should return badge', async () => {
      mock.onGet('/badges/b-1').reply(200, mockBadge);
      const result = await service.getById('b-1');
      expect(result.id).toBe('b-1');
    });
  });

  describe('create', () => {
    it('should create badge', async () => {
      mock.onPost('/badges').reply(201, mockBadge);
      const result = await service.create({ name: 'Star Player' });
      expect(result.name).toBe('Star Player');
    });
  });

  describe('update', () => {
    it('should update badge', async () => {
      mock.onPut('/badges/b-1').reply(200, { ...mockBadge, name: 'MVP' });
      const result = await service.update('b-1', { name: 'MVP' });
      expect(result.name).toBe('MVP');
    });
  });

  describe('delete', () => {
    it('should delete badge', async () => {
      mock.onDelete('/badges/b-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('b-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('getByChild', () => {
    it('should return child badges (uses enrollment endpoint)', async () => {
      mock.onGet(/\/badges\/enrollment\//).reply(200, [mockAward]);
      const result = await service.getByChild('ch-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByEnrollment', () => {
    it('should return enrollment badges', async () => {
      mock.onGet('/badges/enrollment/enr-1').reply(200, [mockAward]);
      const result = await service.getByEnrollment('enr-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle paginated response', async () => {
      mock.onGet('/badges/enrollment/enr-1').reply(200, { items: [mockAward], total: 1 });
      const result = await service.getByEnrollment('enr-1');
      expect(result[0].id).toBe('aw-1');
    });
  });

  describe('getMyChildrenBadges', () => {
    it('should return my children badges', async () => {
      mock.onGet(/\/badges\//).reply(200, { child_1: [mockAward] });
      const result = await service.getMyChildrenBadges();
      expect(result).toBeDefined();
    });
  });

  describe('awardBadge', () => {
    it('should award badge', async () => {
      mock.onPost('/badges/award').reply(201, mockAward);
      const result = await service.awardBadge({ badge_id: 'b-1', child_id: 'ch-1' });
      expect(result.badge_id).toBe('b-1');
    });
  });

  describe('awardBadgeToClass', () => {
    it('should bulk award to class', async () => {
      mock.onPost('/badges/award-class').reply(200, { awarded: 10, failed: 0 });
      const result = await service.awardBadgeToClass({ badge_id: 'b-1', class_id: 'cls-1' });
      expect(result.awarded).toBe(10);
    });
  });

  describe('revokeBadge', () => {
    it('should revoke badge', async () => {
      mock.onPost(/\/badges\//).reply(200, { message: 'Revoked' });
      const result = await service.revokeBadge('aw-1', { reason: 'Error' });
      expect(result).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      mock.onGet(/\/badges\//).reply(200, [{ child_id: 'ch-1', count: 5 }]);
      const result = await service.getLeaderboard({ limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return overall stats when no badgeId', async () => {
      mock.onGet(/\/badges\//).reply(200, { total: 100 });
      const result = await service.getStats();
      expect(result.total).toBe(100);
    });

    it('should return specific badge stats', async () => {
      mock.onGet(/\/badges\//).reply(200, { award_count: 10 });
      const result = await service.getStats('b-1');
      expect(result).toBeDefined();
    });
  });

  describe('checkEligibility', () => {
    it('should check eligibility', async () => {
      mock.onPost(/\/badges\//).reply(200, { eligible: true });
      const result = await service.checkEligibility('ch-1', 'b-1');
      expect(result.eligible).toBe(true);
    });
  });

  describe('getByCategory', () => {
    it('should filter by category', async () => {
      mock.onGet('/badges').reply(200, [mockBadge]);
      const result = await service.getByCategory('skill');
      expect(result[0].category).toBe('skill');
    });
  });

  describe('getRecentAwards', () => {
    it('should return recent awards', async () => {
      mock.onGet(/\/badges\//).reply(200, [mockAward]);
      const result = await service.getRecentAwards(5);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
