/**
 * Discounts Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/discounts.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockDiscount = { id: 'd-1', code: 'SAVE20', type: 'percentage', value: 20, status: 'active' };

describe('discountsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.validate).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.deactivate).toBe('function');
      expect(typeof service.activate).toBe('function');
      expect(typeof service.getUsageStats).toBe('function');
      expect(typeof service.getAvailable).toBe('function');
      expect(typeof service.getMyUsage).toBe('function');
      expect(typeof service.checkEligibility).toBe('function');
      expect(typeof service.getActive).toBe('function');
      expect(typeof service.getExpired).toBe('function');
      expect(typeof service.generateBulk).toBe('function');
      expect(typeof service.export).toBe('function');
      expect(typeof service.checkSiblingDiscount).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return discounts', async () => {
      mock.onGet('/discounts/codes').reply(200, [mockDiscount]);
      const result = await service.getAll();
      expect(result[0].code).toBe('SAVE20');
    });

    it('should pass filters', async () => {
      mock.onGet('/discounts/codes').reply(200, []);
      await service.getAll({ status: 'active' });
    });
  });

  describe('getById', () => {
    it('should return discount by ID', async () => {
      mock.onGet('/discounts/codes/d-1').reply(200, mockDiscount);
      const result = await service.getById('d-1');
      expect(result.code).toBe('SAVE20');
    });

    it('should throw on 404', async () => {
      mock.onGet('/discounts/codes/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('validate', () => {
    it('should validate discount code', async () => {
      mock.onPost('/discounts/validate').reply(200, { valid: true, discount: mockDiscount });
      const result = await service.validate({ code: 'SAVE20', order_amount: 10000 });
      expect(result.valid).toBe(true);
    });

    it('should return invalid for bad code', async () => {
      mock.onPost('/discounts/validate').reply(200, { valid: false, message: 'Invalid code' });
      const result = await service.validate({ code: 'BAD' });
      expect(result.valid).toBe(false);
    });
  });

  describe('create', () => {
    it('should create discount', async () => {
      mock.onPost('/discounts/codes').reply(201, mockDiscount);
      const result = await service.create({ code: 'SAVE20', type: 'percentage', value: 20 });
      expect(result.id).toBe('d-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/discounts/codes').reply(400, { message: 'Code already exists' });
      await expect(service.create({ code: 'SAVE20' })).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update discount', async () => {
      mock.onPut('/discounts/codes/d-1').reply(200, { ...mockDiscount, value: 30 });
      const result = await service.update('d-1', { value: 30 });
      expect(result.value).toBe(30);
    });
  });

  describe('delete', () => {
    it('should delete discount', async () => {
      mock.onDelete('/discounts/codes/d-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('d-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('deactivate', () => {
    it('should deactivate discount', async () => {
      mock.onPost('/discounts/codes/d-1/deactivate').reply(200, { message: 'Deactivated' });
      const result = await service.deactivate('d-1');
      expect(result.message).toBe('Deactivated');
    });
  });

  describe('activate', () => {
    it('should activate discount', async () => {
      mock.onPost('/discounts/codes/d-1/activate').reply(200, { message: 'Activated' });
      const result = await service.activate('d-1');
      expect(result.message).toBe('Activated');
    });
  });

  describe('getUsageStats', () => {
    it('should return usage stats', async () => {
      mock.onGet('/discounts/codes/d-1/usage').reply(200, { total_uses: 50, total_savings: 10000 });
      const result = await service.getUsageStats('d-1');
      expect(result.total_uses).toBe(50);
    });
  });

  describe('getAvailable', () => {
    it('should return available discounts', async () => {
      mock.onGet('/discounts/available').reply(200, [mockDiscount]);
      const result = await service.getAvailable();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMyUsage', () => {
    it('should return usage history', async () => {
      mock.onGet('/discounts/my-usage').reply(200, []);
      const result = await service.getMyUsage();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('checkEligibility', () => {
    it('should check eligibility', async () => {
      mock.onPost('/discounts/check-eligibility').reply(200, { eligible: true });
      const result = await service.checkEligibility('SAVE20');
      expect(result.eligible).toBe(true);
    });
  });

  describe('getActive / getExpired', () => {
    it('should filter active discounts', async () => {
      mock.onGet('/discounts/codes').reply(200, [mockDiscount]);
      const result = await service.getActive();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter expired discounts', async () => {
      mock.onGet('/discounts/codes').reply(200, []);
      const result = await service.getExpired();
      expect(result).toEqual([]);
    });
  });

  describe('generateBulk', () => {
    it('should generate bulk codes', async () => {
      mock.onPost('/discounts/codes/bulk').reply(200, { codes: ['A1', 'A2'], count: 2 });
      const result = await service.generateBulk({ prefix: 'A', count: 2, type: 'percentage', value: 10 });
      expect(result.count).toBe(2);
    });
  });

  describe('export', () => {
    it('should export as blob', async () => {
      const blob = new Blob(['csv data']);
      mock.onGet('/discounts/codes/export').reply(200, blob);
      const result = await service.export();
      expect(result).toBeDefined();
    });
  });

  describe('checkSiblingDiscount', () => {
    it('should check sibling discount eligibility', async () => {
      mock.onGet('/discounts/sibling-eligibility/ch-1').reply(200, {
        eligible: true,
        sibling_count: 2,
        discount_percentage: 10,
      });
      const result = await service.checkSiblingDiscount('ch-1');
      expect(result.eligible).toBe(true);
      expect(result.discount_percentage).toBe(10);
    });
  });
});
