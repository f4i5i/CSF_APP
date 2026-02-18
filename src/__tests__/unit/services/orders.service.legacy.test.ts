/**
 * Orders Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/orders.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockOrder = { id: 'ord-1', status: 'confirmed', total: 10000 };

describe('ordersService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.cancel).toBe('function');
      expect(typeof service.getItems).toBe('function');
      expect(typeof service.getPayments).toBe('function');
      expect(typeof service.getInstallments).toBe('function');
      expect(typeof service.applyDiscount).toBe('function');
      expect(typeof service.removeDiscount).toBe('function');
      expect(typeof service.getInvoice).toBe('function');
      expect(typeof service.downloadInvoice).toBe('function');
      expect(typeof service.getPending).toBe('function');
      expect(typeof service.getConfirmed).toBe('function');
      expect(typeof service.getCompleted).toBe('function');
      expect(typeof service.getCancelled).toBe('function');
      expect(typeof service.calculateTotal).toBe('function');
      expect(typeof service.checkout).toBe('function');
      expect(typeof service.getSummary).toBe('function');
      expect(typeof service.resendConfirmation).toBe('function');
      expect(typeof service.verifyStatus).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return orders', async () => {
      mock.onGet('/orders').reply(200, [mockOrder]);
      const result = await service.getAll();
      expect(result[0].id).toBe('ord-1');
    });

    it('should pass filters', async () => {
      mock.onGet('/orders').reply(200, []);
      await service.getAll({ status: 'pending' });
    });
  });

  describe('getById', () => {
    it('should return order', async () => {
      mock.onGet('/orders/ord-1').reply(200, mockOrder);
      const result = await service.getById('ord-1');
      expect(result.total).toBe(10000);
    });

    it('should throw on 404', async () => {
      mock.onGet('/orders/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create order', async () => {
      mock.onPost('/orders').reply(201, mockOrder);
      const result = await service.create({ items: [{ enrollment_id: 'enr-1', amount: 10000 }] });
      expect(result.id).toBe('ord-1');
    });
  });

  describe('update', () => {
    it('should update order', async () => {
      mock.onPut('/orders/ord-1').reply(200, { ...mockOrder, notes: 'Updated' });
      const result = await service.update('ord-1', { notes: 'Updated' });
      expect(result.notes).toBe('Updated');
    });
  });

  describe('cancel', () => {
    it('should cancel order', async () => {
      mock.onPost('/orders/ord-1/cancel').reply(200, { message: 'Cancelled' });
      const result = await service.cancel('ord-1', { reason: 'Changed mind' });
      expect(result.message).toBe('Cancelled');
    });
  });

  describe('getItems', () => {
    it('should return order items', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, [{ id: 'item-1' }]);
      const result = await service.getItems('ord-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getPayments', () => {
    it('should return order payments', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, []);
      const result = await service.getPayments('ord-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getInstallments', () => {
    it('should return order installments', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, { id: 'ip-1' });
      const result = await service.getInstallments('ord-1');
      expect(result).toBeDefined();
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount', async () => {
      mock.onPost(/\/orders\/ord-1/).reply(200, { ...mockOrder, discount: 2000 });
      const result = await service.applyDiscount('ord-1', { code: 'SAVE20' });
      expect(result.discount).toBe(2000);
    });
  });

  describe('removeDiscount', () => {
    it('should remove discount', async () => {
      mock.onPost(/\/orders\/ord-1/).reply(200, mockOrder);
      const result = await service.removeDiscount('ord-1');
      expect(result).toBeDefined();
    });
  });

  describe('getInvoice', () => {
    it('should return invoice', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, { id: 'inv-1' });
      const result = await service.getInvoice('ord-1');
      expect(result).toBeDefined();
    });
  });

  describe('downloadInvoice', () => {
    it('should download invoice PDF', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, new Blob(['pdf']));
      const result = await service.downloadInvoice('ord-1');
      expect(result).toBeDefined();
    });
  });

  describe('convenience status methods', () => {
    beforeEach(() => {
      mock.onGet('/orders').reply(200, [mockOrder]);
    });

    it('getPending should filter pending', async () => {
      const result = await service.getPending();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getConfirmed should filter confirmed', async () => {
      const result = await service.getConfirmed();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getCompleted should filter completed', async () => {
      const result = await service.getCompleted();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getCancelled should filter cancelled', async () => {
      const result = await service.getCancelled();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total', async () => {
      mock.onPost('/orders/calculate').reply(200, { subtotal: 10000, discount: 0, tax: 800, total: 10800 });
      const result = await service.calculateTotal({ items: [] });
      expect(result.total).toBe(10800);
    });
  });

  describe('checkout', () => {
    it('should process checkout', async () => {
      mock.onPost(/\/orders\//).reply(200, { order_id: 'ord-1', payment_status: 'succeeded' });
      const result = await service.checkout({ items: [], payment_method: 'card' });
      expect(result.payment_status).toBe('succeeded');
    });
  });

  describe('getSummary', () => {
    it('should return summary', async () => {
      mock.onGet(/\/orders\//).reply(200, { total_orders: 10 });
      const result = await service.getSummary();
      expect(result.total_orders).toBe(10);
    });
  });

  describe('resendConfirmation', () => {
    it('should resend confirmation', async () => {
      mock.onPost(/\/orders\/ord-1/).reply(200, { message: 'Sent' });
      const result = await service.resendConfirmation('ord-1');
      expect(result.message).toBe('Sent');
    });
  });

  describe('verifyStatus', () => {
    it('should verify order status', async () => {
      mock.onGet(/\/orders\/ord-1/).reply(200, { status: 'confirmed' });
      const result = await service.verifyStatus('ord-1');
      expect(result.status).toBe('confirmed');
    });
  });
});
