/**
 * Badge Service Unit Tests (TypeScript version)
 * Tests for badge management, awards, and gamification
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const badgeModule = require('../../../api/services/badge.service');
const badgeService =
  badgeModule.badgeService ||
  badgeModule.default?.badgeService ||
  badgeModule.default;

const mock = new MockAdapter(apiClient);

const mockBadge = {
  id: 'badge-1',
  name: 'Perfect Attendance',
  description: 'Attended all classes in the month',
  category: 'attendance',
  icon_url: 'https://cdn.example.com/badges/attendance.png',
  created_at: '2024-01-01T00:00:00Z',
};

const mockAward = {
  id: 'award-1',
  badge_id: 'badge-1',
  child_id: 'child-1',
  badge: mockBadge,
  awarded_at: '2024-02-01T00:00:00Z',
  reason: 'Perfect attendance for January',
};

const mockLeaderboard = [
  { child_id: 'child-1', child_name: 'Emma Smith', badge_count: 10, rank: 1 },
  { child_id: 'child-2', child_name: 'John Doe', badge_count: 8, rank: 2 },
];

const mockStats = {
  total_badges_awarded: 150,
  unique_children: 45,
  most_popular_badge: 'Perfect Attendance',
};

const mockProgress = {
  current_value: 18,
  required_value: 20,
  percentage: 90,
  badge: mockBadge,
};

const mockEligibility = {
  is_eligible: true,
  progress: { current: 20, required: 20 },
};

describe('badgeService (TypeScript)', () => {
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
    it('should have badgeService defined with all methods', () => {
      expect(badgeService).toBeDefined();
      expect(typeof badgeService.getAll).toBe('function');
      expect(typeof badgeService.getById).toBe('function');
      expect(typeof badgeService.create).toBe('function');
      expect(typeof badgeService.update).toBe('function');
      expect(typeof badgeService.delete).toBe('function');
      expect(typeof badgeService.getByChild).toBe('function');
      expect(typeof badgeService.getByEnrollment).toBe('function');
      expect(typeof badgeService.getMyChildrenBadges).toBe('function');
      expect(typeof badgeService.awardBadge).toBe('function');
      expect(typeof badgeService.revokeBadge).toBe('function');
      expect(typeof badgeService.getLeaderboard).toBe('function');
      expect(typeof badgeService.getStats).toBe('function');
      expect(typeof badgeService.checkEligibility).toBe('function');
      expect(typeof badgeService.getProgress).toBe('function');
      expect(typeof badgeService.getByCategory).toBe('function');
      expect(typeof badgeService.getRecentAwards).toBe('function');
    });
  });

  // ===========================================
  // GET ALL BADGES
  // ===========================================
  describe('getAll', () => {
    it('should return all badges', async () => {
      mock.onGet('/badges').reply(200, [mockBadge]);
      const result = await badgeService.getAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('Perfect Attendance');
    });

    it('should pass filter params', async () => {
      mock.onGet('/badges').reply((config) => {
        expect(config.params).toEqual({ category: 'attendance' });
        return [200, [mockBadge]];
      });
      await badgeService.getAll({ category: 'attendance' });
    });

    it('should throw on 500', async () => {
      mock.onGet('/badges').reply(500, { message: 'Server error' });
      await expect(badgeService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return badge by ID', async () => {
      mock.onGet('/badges/badge-1').reply(200, mockBadge);
      const result = await badgeService.getById('badge-1');
      expect(result.id).toBe('badge-1');
      expect(result.name).toBe('Perfect Attendance');
    });

    it('should throw on 404', async () => {
      mock.onGet('/badges/bad-id').reply(404, { message: 'Not found' });
      await expect(badgeService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE BADGE
  // ===========================================
  describe('create', () => {
    it('should create badge successfully', async () => {
      const newBadge = { name: 'New Badge', category: 'skill', description: 'A skill badge' };
      mock.onPost('/badges').reply(201, { id: 'badge-2', ...newBadge });
      const result = await badgeService.create(newBadge);
      expect(result.id).toBe('badge-2');
      expect(result.name).toBe('New Badge');
    });

    it('should throw on 400', async () => {
      mock.onPost('/badges').reply(400, { message: 'Name required' });
      await expect(badgeService.create({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE BADGE
  // ===========================================
  describe('update', () => {
    it('should update badge', async () => {
      const updated = { ...mockBadge, description: 'Updated description' };
      mock.onPut('/badges/badge-1').reply(200, updated);
      const result = await badgeService.update('badge-1', { description: 'Updated description' });
      expect(result.description).toBe('Updated description');
    });

    it('should throw on 404', async () => {
      mock.onPut('/badges/bad-id').reply(404, { message: 'Not found' });
      await expect(badgeService.update('bad-id', {} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // DELETE BADGE
  // ===========================================
  describe('delete', () => {
    it('should delete badge', async () => {
      mock.onDelete('/badges/badge-1').reply(200, { message: 'Badge deleted successfully' });
      const result = await badgeService.delete('badge-1');
      expect(result.message).toBe('Badge deleted successfully');
    });

    it('should throw on 404', async () => {
      mock.onDelete('/badges/bad-id').reply(404, { message: 'Not found' });
      await expect(badgeService.delete('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY CHILD
  // ===========================================
  describe('getByChild', () => {
    it('should return badges for a child', async () => {
      mock.onGet('/badges/child/child-1').reply(200, [mockAward]);
      const result = await badgeService.getByChild('child-1');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].child_id).toBe('child-1');
    });
  });

  // ===========================================
  // GET BY ENROLLMENT
  // ===========================================
  describe('getByEnrollment', () => {
    it('should return badges for an enrollment', async () => {
      mock.onGet('/badges/enrollment/enr-1').reply(200, [mockAward]);
      const result = await badgeService.getByEnrollment('enr-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ===========================================
  // GET MY CHILDREN BADGES
  // ===========================================
  describe('getMyChildrenBadges', () => {
    it('should return children badges', async () => {
      const response = [{ child_id: 'child-1', badges: [mockAward] }];
      mock.onGet('/badges/my-children').reply(200, response);
      const result = await badgeService.getMyChildrenBadges();
      expect(result[0].child_id).toBe('child-1');
    });
  });

  // ===========================================
  // AWARD BADGE
  // ===========================================
  describe('awardBadge', () => {
    it('should award badge to child', async () => {
      const awardData = { badge_id: 'badge-1', child_id: 'child-1', reason: 'Great job' };
      mock.onPost('/badges/award').reply(201, mockAward);
      const result = await badgeService.awardBadge(awardData);
      expect(result.badge_id).toBe('badge-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/badges/award').reply(400, { message: 'Already awarded' });
      await expect(badgeService.awardBadge({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // REVOKE BADGE
  // ===========================================
  describe('revokeBadge', () => {
    it('should revoke badge', async () => {
      mock.onPost('/badges/awards/award-1/revoke').reply(200, { message: 'Badge revoked' });
      const result = await badgeService.revokeBadge('award-1', { reason: 'Error' });
      expect(result.message).toBe('Badge revoked');
    });
  });

  // ===========================================
  // GET LEADERBOARD
  // ===========================================
  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      mock.onGet('/badges/leaderboard').reply(200, mockLeaderboard);
      const result = await badgeService.getLeaderboard({ limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].rank).toBe(1);
    });
  });

  // ===========================================
  // GET STATS
  // ===========================================
  describe('getStats', () => {
    it('should return overall stats when no badgeId', async () => {
      mock.onGet('/badges/stats').reply(200, mockStats);
      const result = await badgeService.getStats();
      expect(result.total_badges_awarded).toBe(150);
    });

    it('should return specific badge stats', async () => {
      mock.onGet('/badges/badge-1/stats').reply(200, { award_count: 10 });
      const result = await badgeService.getStats('badge-1');
      expect(result.award_count).toBe(10);
    });
  });

  // ===========================================
  // CHECK ELIGIBILITY
  // ===========================================
  describe('checkEligibility', () => {
    it('should check eligibility', async () => {
      mock.onPost('/badges/check-eligibility').reply(200, mockEligibility);
      const result = await badgeService.checkEligibility('child-1', 'badge-1');
      expect(result.is_eligible).toBe(true);
    });
  });

  // ===========================================
  // GET PROGRESS
  // ===========================================
  describe('getProgress', () => {
    it('should return badge progress for child', async () => {
      mock.onGet('/badges/child/child-1/progress/badge-1').reply(200, mockProgress);
      const result = await badgeService.getProgress('child-1', 'badge-1');
      expect(result.percentage).toBe(90);
    });
  });

  // ===========================================
  // GET BY CATEGORY
  // ===========================================
  describe('getByCategory', () => {
    it('should filter badges by category', async () => {
      mock.onGet('/badges').reply(200, [mockBadge]);
      const result = await badgeService.getByCategory('attendance');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ===========================================
  // GET RECENT AWARDS
  // ===========================================
  describe('getRecentAwards', () => {
    it('should return recent awards', async () => {
      mock.onGet('/badges/recent-awards').reply(200, [mockAward]);
      const result = await badgeService.getRecentAwards(5);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should default to 10 limit', async () => {
      mock.onGet('/badges/recent-awards').reply(200, [mockAward]);
      const result = await badgeService.getRecentAwards();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
