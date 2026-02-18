/**
 * Payment Service Unit Tests (TypeScript version)
 * Tests for payment and installment service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const paymentModule = require('../../../api/services/payment.service');
const paymentService =
  paymentModule.paymentService ||
  paymentModule.default?.paymentService ||
  paymentModule.default;
const installmentService =
  paymentModule.installmentService ||
  paymentModule.default?.installmentService;

const mock = new MockAdapter(apiClient);

const mockPayment = {
  id: 'pay-1',
  amount: 10000,
  status: 'succeeded',
  stripe_payment_intent_id: 'pi_test_123',
  created_at: '2024-01-15T10:00:00Z',
};

const mockPaymentMethod = {
  id: 'pm_test_123',
  card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2025 },
  is_default: true,
};

const mockSetupIntent = {
  id: 'seti_test_123',
  client_secret: 'seti_test_secret_123',
};

const mockRefund = {
  id: 'refund-1',
  payment_id: 'pay-1',
  amount: 5000,
  stripe_refund_id: 're_test_123',
  status: 'succeeded',
};

const mockInstallmentPlan = {
  id: 'inst-1',
  order_id: 'order-1',
  total_amount: 60000,
  number_of_installments: 3,
  frequency: 'monthly',
  status: 'active',
  amount_paid: 20000,
  amount_remaining: 40000,
};

const mockInstallmentPayment = {
  id: 'inst-pay-1',
  plan_id: 'inst-1',
  amount: 20000,
  due_date: '2024-02-01',
  status: 'succeeded',
};

const mockInstallmentSummary = {
  active_plans_count: 2,
  total_owed: 80000,
  total_paid: 40000,
  upcoming_payments: 4,
  overdue_payments: 0,
};

const mockPreview = {
  amount_per_installment: 20000,
  schedule: [
    { due_date: '2024-02-01', amount: 20000 },
    { due_date: '2024-03-01', amount: 20000 },
    { due_date: '2024-04-01', amount: 20000 },
  ],
};

describe('paymentService (TypeScript)', () => {
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
    it('should have paymentService defined', () => {
      expect(paymentService).toBeDefined();
      expect(typeof paymentService.getMy).toBe('function');
      expect(typeof paymentService.getAll).toBe('function');
      expect(typeof paymentService.getById).toBe('function');
      expect(typeof paymentService.createSetupIntent).toBe('function');
      expect(typeof paymentService.getPaymentMethods).toBe('function');
      expect(typeof paymentService.attachPaymentMethod).toBe('function');
      expect(typeof paymentService.setDefaultPaymentMethod).toBe('function');
      expect(typeof paymentService.deletePaymentMethod).toBe('function');
      expect(typeof paymentService.requestRefund).toBe('function');
      expect(typeof paymentService.downloadInvoice).toBe('function');
    });

    it('should have installmentService defined', () => {
      expect(installmentService).toBeDefined();
      expect(typeof installmentService.getMy).toBe('function');
      expect(typeof installmentService.getAll).toBe('function');
      expect(typeof installmentService.getById).toBe('function');
      expect(typeof installmentService.preview).toBe('function');
      expect(typeof installmentService.create).toBe('function');
      expect(typeof installmentService.cancel).toBe('function');
      expect(typeof installmentService.getSummary).toBe('function');
      expect(typeof installmentService.getPayments).toBe('function');
      expect(typeof installmentService.attemptPayment).toBe('function');
    });
  });

  // ===========================================
  // GET MY PAYMENTS
  // ===========================================
  describe('getMy', () => {
    it('should return user payments', async () => {
      mock.onGet('/payments/my').reply(200, [mockPayment]);
      const result = await paymentService.getMy();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].amount).toBe(10000);
    });

    it('should pass filter params', async () => {
      mock.onGet('/payments/my').reply(200, [mockPayment]);
      await paymentService.getMy({ status: 'succeeded' });
    });

    it('should throw on 401', async () => {
      mock.onGet('/payments/my').reply(401, { message: 'Unauthorized' });
      await expect(paymentService.getMy()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET ALL PAYMENTS
  // ===========================================
  describe('getAll', () => {
    it('should return all payments', async () => {
      mock.onGet('/payments').reply(200, [mockPayment]);
      const result = await paymentService.getAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw on 403', async () => {
      mock.onGet('/payments').reply(403, { message: 'Forbidden' });
      await expect(paymentService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return payment by ID', async () => {
      mock.onGet('/payments/pay-1').reply(200, mockPayment);
      const result = await paymentService.getById('pay-1');
      expect(result.id).toBe('pay-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/payments/bad-id').reply(404, { message: 'Not found' });
      await expect(paymentService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE SETUP INTENT
  // ===========================================
  describe('createSetupIntent', () => {
    it('should create setup intent', async () => {
      mock.onPost('/payments/setup-intent').reply(200, mockSetupIntent);
      const result = await paymentService.createSetupIntent();
      expect(result.client_secret).toBe('seti_test_secret_123');
    });
  });

  // ===========================================
  // GET PAYMENT METHODS
  // ===========================================
  describe('getPaymentMethods', () => {
    it('should return payment methods', async () => {
      mock.onGet('/payments/methods').reply(200, [mockPaymentMethod]);
      const result = await paymentService.getPaymentMethods();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].card.last4).toBe('4242');
    });
  });

  // ===========================================
  // ATTACH PAYMENT METHOD
  // ===========================================
  describe('attachPaymentMethod', () => {
    it('should attach payment method', async () => {
      mock.onPost('/payments/methods/attach').reply(200, mockPaymentMethod);
      const result = await paymentService.attachPaymentMethod({
        payment_method_id: 'pm_test_123',
        set_as_default: true,
      });
      expect(result.id).toBe('pm_test_123');
    });
  });

  // ===========================================
  // SET DEFAULT PAYMENT METHOD
  // ===========================================
  describe('setDefaultPaymentMethod', () => {
    it('should set default payment method', async () => {
      mock.onPost('/payments/methods/pm_test_123/default').reply(200, mockPaymentMethod);
      const result = await paymentService.setDefaultPaymentMethod('pm_test_123');
      expect(result.is_default).toBe(true);
    });
  });

  // ===========================================
  // DELETE PAYMENT METHOD
  // ===========================================
  describe('deletePaymentMethod', () => {
    it('should delete payment method', async () => {
      mock.onDelete('/payments/methods/pm_test_123').reply(200);
      await paymentService.deletePaymentMethod('pm_test_123');
    });

    it('should throw on 400 (active installment)', async () => {
      mock.onDelete('/payments/methods/pm_test_123').reply(400, {
        message: 'Cannot delete - payment method is in use',
      });
      await expect(paymentService.deletePaymentMethod('pm_test_123')).rejects.toThrow();
    });
  });

  // ===========================================
  // REQUEST REFUND
  // ===========================================
  describe('requestRefund', () => {
    it('should process refund', async () => {
      mock.onPost('/payments/refund').reply(200, mockRefund);
      const result = await paymentService.requestRefund({
        payment_id: 'pay-1',
        reason: 'requested_by_customer',
      });
      expect(result.stripe_refund_id).toBe('re_test_123');
    });

    it('should throw on 403', async () => {
      mock.onPost('/payments/refund').reply(403, { message: 'Forbidden' });
      await expect(paymentService.requestRefund({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // DOWNLOAD INVOICE
  // ===========================================
  describe('downloadInvoice', () => {
    it('should download invoice as blob', async () => {
      const blob = new Blob(['PDF data'], { type: 'application/pdf' });
      mock.onGet('/payments/pay-1/invoice/download').reply(200, blob);
      const result = await paymentService.downloadInvoice('pay-1');
      expect(result).toBeDefined();
    });
  });
});

describe('installmentService (TypeScript)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // GET MY INSTALLMENTS
  // ===========================================
  describe('getMy', () => {
    it('should return user installment plans', async () => {
      mock.onGet('/installments/my').reply(200, [mockInstallmentPlan]);
      const result = await installmentService.getMy();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].status).toBe('active');
    });

    it('should pass filters', async () => {
      mock.onGet('/installments/my').reply(200, [mockInstallmentPlan]);
      await installmentService.getMy({ status: 'active' });
    });
  });

  // ===========================================
  // GET ALL INSTALLMENTS
  // ===========================================
  describe('getAll', () => {
    it('should return all installment plans', async () => {
      mock.onGet('/installments').reply(200, [mockInstallmentPlan]);
      const result = await installmentService.getAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return installment plan by ID', async () => {
      mock.onGet('/installments/inst-1').reply(200, mockInstallmentPlan);
      const result = await installmentService.getById('inst-1');
      expect(result.id).toBe('inst-1');
      expect(result.total_amount).toBe(60000);
    });

    it('should throw on 404', async () => {
      mock.onGet('/installments/bad-id').reply(404, { message: 'Not found' });
      await expect(installmentService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // PREVIEW
  // ===========================================
  describe('preview', () => {
    it('should return installment preview', async () => {
      mock.onPost('/installments/preview').reply(200, mockPreview);
      const result = await installmentService.preview({
        total_amount: 60000,
        number_of_installments: 3,
        frequency: 'monthly',
      });
      expect(result.amount_per_installment).toBe(20000);
      expect(result.schedule.length).toBe(3);
    });
  });

  // ===========================================
  // CREATE
  // ===========================================
  describe('create', () => {
    it('should create installment plan', async () => {
      mock.onPost('/installments').reply(201, mockInstallmentPlan);
      const result = await installmentService.create({
        order_id: 'order-1',
        number_of_installments: 3,
        frequency: 'monthly',
        payment_method_id: 'pm_test_123',
      });
      expect(result.id).toBe('inst-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/installments').reply(400, { message: 'Invalid data' });
      await expect(installmentService.create({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // CANCEL
  // ===========================================
  describe('cancel', () => {
    it('should cancel installment plan', async () => {
      mock.onDelete('/installments/inst-1').reply(200, { message: 'Plan cancelled' });
      const result = await installmentService.cancel('inst-1');
      expect(result.message).toBe('Plan cancelled');
    });
  });

  // ===========================================
  // GET SUMMARY
  // ===========================================
  describe('getSummary', () => {
    it('should return installment summary', async () => {
      mock.onGet('/installments/my').reply(200, mockInstallmentSummary);
      const result = await installmentService.getSummary();
      expect(result.active_plans_count).toBe(2);
    });
  });

  // ===========================================
  // GET PAYMENTS
  // ===========================================
  describe('getPayments', () => {
    it('should return payments for a plan', async () => {
      mock.onGet('/installments/inst-1/schedule').reply(200, [mockInstallmentPayment]);
      const result = await installmentService.getPayments('inst-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ===========================================
  // ATTEMPT PAYMENT
  // ===========================================
  describe('attemptPayment', () => {
    it('should attempt payment', async () => {
      const response = { message: 'Payment processed', payment: { ...mockInstallmentPayment, status: 'succeeded' } };
      mock.onPost('/installments/inst-1/payments/inst-pay-1/attempt').reply(200, response);
      const result = await installmentService.attemptPayment('inst-1', 'inst-pay-1');
      expect(result.message).toBe('Payment processed');
    });
  });
});
