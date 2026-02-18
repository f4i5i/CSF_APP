/**
 * Order Service Unit Tests (TypeScript version)
 * Tests for order management and checkout flow
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const orderModule = require('../../../api/services/order.service');
const orderService =
  orderModule.orderService ||
  orderModule.default?.orderService ||
  orderModule.default;

const mock = new MockAdapter(apiClient);

const mockOrder = {
  id: 'order-1',
  user_id: 'user-1',
  status: 'DRAFT',
  subtotal: 10000,
  discount_total: 0,
  tax: 800,
  total: 10800,
  line_items: [
    { id: 'item-1', enrollment_id: 'enr-1', description: 'Soccer 101', amount: 10000 },
  ],
  created_at: '2024-01-15T10:00:00Z',
};

const mockCalculation = {
  subtotal: 10000,
  discount_amount: 2000,
  tax: 640,
  total: 8640,
  line_items: [
    { description: 'Soccer 101', amount: 10000 },
  ],
};

const mockCheckoutResponse = {
  client_secret: 'pi_test_secret_123',
  payment_intent_id: 'pi_test_123',
  amount: 10800,
};

describe('orderService (TypeScript)', () => {
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
    it('should have orderService defined with all methods', () => {
      expect(orderService).toBeDefined();
      expect(typeof orderService.getMy).toBe('function');
      expect(typeof orderService.getAll).toBe('function');
      expect(typeof orderService.getById).toBe('function');
      expect(typeof orderService.calculate).toBe('function');
      expect(typeof orderService.calculateTotal).toBe('function');
      expect(typeof orderService.create).toBe('function');
      expect(typeof orderService.checkout).toBe('function');
      expect(typeof orderService.confirm).toBe('function');
      expect(typeof orderService.cancel).toBe('function');
    });
  });

  // ===========================================
  // GET MY ORDERS
  // ===========================================
  describe('getMy', () => {
    it('should return user orders', async () => {
      mock.onGet('/orders/my').reply(200, [mockOrder]);
      const result = await orderService.getMy();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe('order-1');
    });

    it('should pass filter params', async () => {
      mock.onGet('/orders/my').reply((config) => {
        expect(config.params).toEqual({ status: 'PAID' });
        return [200, [mockOrder]];
      });
      await orderService.getMy({ status: 'PAID' });
    });

    it('should throw on 401', async () => {
      mock.onGet('/orders/my').reply(401, { message: 'Unauthorized' });
      await expect(orderService.getMy()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET ALL ORDERS (ADMIN)
  // ===========================================
  describe('getAll', () => {
    it('should return all orders', async () => {
      mock.onGet('/orders').reply(200, [mockOrder]);
      const result = await orderService.getAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw on 403 forbidden', async () => {
      mock.onGet('/orders').reply(403, { message: 'Forbidden' });
      await expect(orderService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return order by ID', async () => {
      mock.onGet('/orders/order-1').reply(200, mockOrder);
      const result = await orderService.getById('order-1');
      expect(result.id).toBe('order-1');
      expect(result.total).toBe(10800);
    });

    it('should throw on 404', async () => {
      mock.onGet('/orders/bad-id').reply(404, { message: 'Order not found' });
      await expect(orderService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CALCULATE
  // ===========================================
  describe('calculate', () => {
    it('should calculate order total', async () => {
      mock.onPost('/orders/calculate').reply(200, mockCalculation);
      const result = await orderService.calculate({
        enrollment_ids: ['enr-1'],
        discount_code: 'SAVE20',
      });
      expect(result.total).toBe(8640);
      expect(result.discount_amount).toBe(2000);
    });

    it('should throw on invalid discount code', async () => {
      mock.onPost('/orders/calculate').reply(400, { message: 'Invalid discount code' });
      await expect(
        orderService.calculate({ enrollment_ids: ['enr-1'], discount_code: 'INVALID' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // CALCULATE TOTAL (alias)
  // ===========================================
  describe('calculateTotal', () => {
    it('should call calculate', async () => {
      mock.onPost('/orders/calculate').reply(200, mockCalculation);
      const result = await orderService.calculateTotal({ enrollment_ids: ['enr-1'] });
      expect(result.total).toBe(8640);
    });
  });

  // ===========================================
  // CREATE ORDER
  // ===========================================
  describe('create', () => {
    it('should create order successfully', async () => {
      mock.onPost('/orders').reply(201, mockOrder);
      const result = await orderService.create({
        enrollment_ids: ['enr-1'],
        discount_code: 'SAVE20',
      });
      expect(result.id).toBe('order-1');
      expect(result.status).toBe('DRAFT');
    });

    it('should throw on 400', async () => {
      mock.onPost('/orders').reply(400, { message: 'Invalid enrollment IDs' });
      await expect(orderService.create({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // CHECKOUT
  // ===========================================
  describe('checkout', () => {
    it('should create payment intent', async () => {
      mock.onPost('/orders/order-1/pay').reply(200, mockCheckoutResponse);
      const result = await orderService.checkout('order-1', { save_payment_method: true });
      expect(result.client_secret).toBe('pi_test_secret_123');
      expect(result.payment_intent_id).toBe('pi_test_123');
    });

    it('should throw on already paid order', async () => {
      mock.onPost('/orders/order-1/pay').reply(400, { message: 'Order already paid' });
      await expect(orderService.checkout('order-1', {} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // CONFIRM
  // ===========================================
  describe('confirm', () => {
    it('should confirm payment', async () => {
      const confirmedOrder = { ...mockOrder, status: 'PAID' };
      mock.onPost('/orders/order-1/confirm').reply(200, confirmedOrder);
      const result = await orderService.confirm('order-1', {
        payment_intent_id: 'pi_test_123',
        status: 'succeeded',
      });
      expect(result.status).toBe('PAID');
    });

    it('should throw on verification failure', async () => {
      mock.onPost('/orders/order-1/confirm').reply(400, { message: 'Payment verification failed' });
      await expect(
        orderService.confirm('order-1', { payment_intent_id: 'bad', status: 'failed' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // CANCEL
  // ===========================================
  describe('cancel', () => {
    it('should cancel order', async () => {
      mock.onPost('/orders/order-1/cancel').reply(200, { message: 'Order cancelled successfully' });
      const result = await orderService.cancel('order-1');
      expect(result.message).toBe('Order cancelled successfully');
    });

    it('should throw on already paid order', async () => {
      mock.onPost('/orders/order-1/cancel').reply(400, { message: 'Cannot cancel paid order' });
      await expect(orderService.cancel('order-1')).rejects.toThrow();
    });

    it('should throw on 404', async () => {
      mock.onPost('/orders/bad-id/cancel').reply(404, { message: 'Not found' });
      await expect(orderService.cancel('bad-id')).rejects.toThrow();
    });
  });
});
