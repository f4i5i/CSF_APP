/**
 * Installments Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/installments.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockPlan = { id: 'ip-1', order_id: 'ord-1', total_amount: 60000, installments_count: 3, status: 'active' };

describe('installmentsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.cancel).toBe('function');
      expect(typeof service.getUpcoming).toBe('function');
      expect(typeof service.getOverdue).toBe('function');
      expect(typeof service.payInstallment).toBe('function');
      expect(typeof service.getPaymentHistory).toBe('function');
      expect(typeof service.getSchedule).toBe('function');
      expect(typeof service.updateDueDate).toBe('function');
      expect(typeof service.markAsPaid).toBe('function');
      expect(typeof service.calculatePlan).toBe('function');
      expect(typeof service.getActive).toBe('function');
      expect(typeof service.getCompleted).toBe('function');
      expect(typeof service.getSummary).toBe('function');
      expect(typeof service.setupAutoPay).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return installment plans', async () => {
      mock.onGet('/installments').reply(200, [mockPlan]);
      const result = await service.getAll();
      expect(result[0].id).toBe('ip-1');
    });

    it('should pass filters', async () => {
      mock.onGet('/installments').reply(200, []);
      await service.getAll({ status: 'active' });
    });
  });

  describe('getById', () => {
    it('should return plan', async () => {
      mock.onGet('/installments/ip-1').reply(200, mockPlan);
      const result = await service.getById('ip-1');
      expect(result.total_amount).toBe(60000);
    });

    it('should throw on 404', async () => {
      mock.onGet('/installments/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create plan', async () => {
      mock.onPost('/installments').reply(201, mockPlan);
      const result = await service.create({ order_id: 'ord-1', installments_count: 3 });
      expect(result.id).toBe('ip-1');
    });
  });

  describe('update', () => {
    it('should update plan', async () => {
      mock.onPut('/installments/ip-1').reply(200, { ...mockPlan, installments_count: 4 });
      const result = await service.update('ip-1', { installments_count: 4 });
      expect(result.installments_count).toBe(4);
    });
  });

  describe('cancel', () => {
    it('should cancel plan', async () => {
      mock.onPost('/installments/ip-1/cancel').reply(200, { message: 'Cancelled' });
      const result = await service.cancel('ip-1', { reason: 'Changed mind' });
      expect(result.message).toBe('Cancelled');
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming installments', async () => {
      mock.onGet('/installments/upcoming/due').reply(200, [{ id: 'inst-1', due_date: '2024-02-01' }]);
      const result = await service.getUpcoming(7);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOverdue', () => {
    it('should return overdue installments', async () => {
      mock.onGet('/installments/overdue').reply(200, []);
      const result = await service.getOverdue();
      expect(result).toEqual([]);
    });
  });

  describe('payInstallment', () => {
    it('should pay installment', async () => {
      mock.onPost(/\/installments\//).reply(200, { message: 'Paid' });
      const result = await service.payInstallment('inst-1', { payment_method: 'card' });
      expect(result.message).toBe('Paid');
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history', async () => {
      mock.onGet(/\/installments\//).reply(200, []);
      const result = await service.getPaymentHistory('ip-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule', async () => {
      mock.onGet('/installments/ip-1/schedule').reply(200, [{ due_date: '2024-02-01', amount: 20000 }]);
      const result = await service.getSchedule('ip-1');
      expect(result[0].amount).toBe(20000);
    });
  });

  describe('updateDueDate', () => {
    it('should update due date', async () => {
      mock.onPut(/\/installments\//).reply(200, { message: 'Updated' });
      const result = await service.updateDueDate('inst-1', { new_due_date: '2024-03-01' });
      expect(result.message).toBe('Updated');
    });
  });

  describe('markAsPaid', () => {
    it('should mark as paid', async () => {
      mock.onPost(/\/installments\//).reply(200, { message: 'Marked paid' });
      const result = await service.markAsPaid('inst-1', { payment_method: 'cash' });
      expect(result.message).toBe('Marked paid');
    });
  });

  describe('calculatePlan', () => {
    it('should calculate plan preview', async () => {
      mock.onPost(/\/installments\//).reply(200, { schedule: [], amount_per_installment: 20000 });
      const result = await service.calculatePlan({ total_amount: 60000, installments_count: 3 });
      expect(result.amount_per_installment).toBe(20000);
    });
  });

  describe('getActive / getCompleted', () => {
    it('should get active plans', async () => {
      mock.onGet('/installments').reply(200, [mockPlan]);
      const result = await service.getActive();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get completed plans', async () => {
      mock.onGet('/installments').reply(200, []);
      const result = await service.getCompleted();
      expect(result).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('should return summary', async () => {
      mock.onGet('/installments/my').reply(200, { total_plans: 2 });
      const result = await service.getSummary();
      expect(result).toBeDefined();
    });
  });

  describe('setupAutoPay', () => {
    it('should setup auto-pay', async () => {
      mock.onPost(/\/installments\//).reply(200, { enabled: true });
      const result = await service.setupAutoPay('ip-1', { payment_method_id: 'pm-1', enabled: true });
      expect(result.enabled).toBe(true);
    });
  });
});
