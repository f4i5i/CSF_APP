/**
 * Payments Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/payments.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockPayment = { id: 'pay-1', amount: 10000, status: 'completed' };
const mockMethod = { id: 'pm-1', card: { brand: 'visa', last4: '4242' } };

describe('paymentsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.createIntent).toBe('function');
      expect(typeof service.confirm).toBe('function');
      expect(typeof service.process).toBe('function');
      expect(typeof service.refund).toBe('function');
      expect(typeof service.getReceipt).toBe('function');
      expect(typeof service.downloadReceipt).toBe('function');
      expect(typeof service.createSetupIntent).toBe('function');
      expect(typeof service.getPaymentMethods).toBe('function');
      expect(typeof service.addPaymentMethod).toBe('function');
      expect(typeof service.removePaymentMethod).toBe('function');
      expect(typeof service.setDefaultPaymentMethod).toBe('function');
      expect(typeof service.getByOrder).toBe('function');
      expect(typeof service.getCompleted).toBe('function');
      expect(typeof service.getPending).toBe('function');
      expect(typeof service.getFailed).toBe('function');
      expect(typeof service.getStats).toBe('function');
      expect(typeof service.verifyStatus).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return payments', async () => {
      mock.onGet('/payments').reply(200, [mockPayment]);
      const result = await service.getAll();
      expect(result[0].amount).toBe(10000);
    });

    it('should pass filters', async () => {
      mock.onGet('/payments').reply(200, []);
      await service.getAll({ status: 'completed' });
    });
  });

  describe('getById', () => {
    it('should return payment', async () => {
      mock.onGet('/payments/pay-1').reply(200, mockPayment);
      const result = await service.getById('pay-1');
      expect(result.id).toBe('pay-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/payments/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('createIntent', () => {
    it('should create payment intent', async () => {
      // createIntent posts to /orders/{orderId}/pay
      mock.onPost('/orders/ord-1/pay').reply(200, { client_secret: 'pi_secret', payment_intent_id: 'pi_1' });
      const result = await service.createIntent({ order_id: 'ord-1', payment_method_id: 'pm-1' });
      expect(result.client_secret).toBe('pi_secret');
    });
  });

  describe('confirm', () => {
    it('should confirm payment', async () => {
      mock.onPost('/payments/pi_1/confirm').reply(200, { status: 'succeeded' });
      const result = await service.confirm('pi_1', { payment_method_id: 'pm-1' });
      expect(result.status).toBe('succeeded');
    });
  });

  describe('process', () => {
    it('should process payment', async () => {
      mock.onPost('/payments/process').reply(200, mockPayment);
      const result = await service.process({ order_id: 'ord-1', amount: 10000 });
      expect(result.id).toBe('pay-1');
    });
  });

  describe('refund', () => {
    it('should request refund', async () => {
      mock.onPost('/payments/pay-1/refund').reply(200, { refund_id: 'ref-1', status: 'succeeded' });
      const result = await service.refund('pay-1', { reason: 'Customer request' });
      expect(result.status).toBe('succeeded');
    });
  });

  describe('getReceipt', () => {
    it('should return receipt data', async () => {
      mock.onGet('/payments/pay-1/receipt').reply(200, { receipt_url: 'https://example.com' });
      const result = await service.getReceipt('pay-1');
      expect(result.receipt_url).toBeDefined();
    });
  });

  describe('downloadReceipt', () => {
    it('should download receipt PDF', async () => {
      mock.onGet('/payments/pay-1/invoice/download').reply(200, new Blob(['pdf']));
      const result = await service.downloadReceipt('pay-1');
      expect(result).toBeDefined();
    });
  });

  describe('createSetupIntent', () => {
    it('should create setup intent', async () => {
      mock.onPost('/payments/setup-intent').reply(200, { client_secret: 'seti_secret' });
      const result = await service.createSetupIntent();
      expect(result.client_secret).toBe('seti_secret');
    });
  });

  describe('getPaymentMethods', () => {
    it('should return payment methods', async () => {
      mock.onGet('/payments/methods').reply(200, [mockMethod]);
      const result = await service.getPaymentMethods();
      expect(result[0].card.last4).toBe('4242');
    });
  });

  describe('addPaymentMethod', () => {
    it('should add payment method', async () => {
      mock.onPost('/payments/methods').reply(200, mockMethod);
      const result = await service.addPaymentMethod({ payment_method_id: 'pm_new' });
      expect(result.id).toBe('pm-1');
    });
  });

  describe('removePaymentMethod', () => {
    it('should remove payment method', async () => {
      mock.onDelete('/payments/methods/pm-1').reply(200, { message: 'Removed' });
      const result = await service.removePaymentMethod('pm-1');
      expect(result.message).toBe('Removed');
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should set default', async () => {
      mock.onPost('/payments/methods/pm-1/default').reply(200, { ...mockMethod, is_default: true });
      const result = await service.setDefaultPaymentMethod('pm-1');
      expect(result.is_default).toBe(true);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mock.onGet('/payments').reply(200, [mockPayment]);
    });

    it('getByOrder should filter by order', async () => {
      const result = await service.getByOrder('ord-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getCompleted should filter completed', async () => {
      const result = await service.getCompleted();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getPending should filter pending', async () => {
      const result = await service.getPending();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getFailed should filter failed', async () => {
      const result = await service.getFailed();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      mock.onGet('/payments/stats').reply(200, { total_revenue: 500000 });
      const result = await service.getStats({ start_date: '2024-01-01' });
      expect(result.total_revenue).toBe(500000);
    });
  });

  describe('verifyStatus', () => {
    it('should verify status', async () => {
      mock.onGet('/payments/pay-1/verify').reply(200, { status: 'completed' });
      const result = await service.verifyStatus('pay-1');
      expect(result.status).toBe('completed');
    });
  });
});
