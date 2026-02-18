/**
 * Invoices Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/invoices.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockInvoice = { id: 'inv-1', status: 'paid', amount: 10000, stripe_invoice_id: 'in_test_123' };

describe('invoicesService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getBillingSummary).toBe('function');
      expect(typeof service.getMyInvoices).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.downloadPdf).toBe('function');
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.syncFromStripe).toBe('function');
      expect(typeof service.syncAllFromStripe).toBe('function');
    });
  });

  describe('getBillingSummary', () => {
    it('should return billing summary', async () => {
      mock.onGet('/invoices/billing-summary').reply(200, { total_due: 5000, next_due_date: '2024-02-01' });
      const result = await service.getBillingSummary();
      expect(result.total_due).toBe(5000);
    });

    it('should throw on 500', async () => {
      mock.onGet('/invoices/billing-summary').reply(500);
      await expect(service.getBillingSummary()).rejects.toThrow();
    });
  });

  describe('getMyInvoices', () => {
    it('should return user invoices', async () => {
      mock.onGet('/invoices/my').reply(200, { items: [mockInvoice], total: 1 });
      const result = await service.getMyInvoices();
      expect(result.items[0].id).toBe('inv-1');
    });

    it('should pass filters', async () => {
      mock.onGet('/invoices/my').reply(200, { items: [], total: 0 });
      await service.getMyInvoices({ status: 'paid', limit: 10 });
    });
  });

  describe('getById', () => {
    it('should return invoice by ID', async () => {
      mock.onGet('/invoices/inv-1').reply(200, mockInvoice);
      const result = await service.getById('inv-1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/invoices/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('downloadPdf', () => {
    it('should download PDF as blob', async () => {
      const blob = new Blob(['PDF'], { type: 'application/pdf' });
      mock.onGet('/invoices/inv-1/download').reply(200, blob);
      const result = await service.downloadPdf('inv-1');
      expect(result).toBeDefined();
    });
  });

  describe('getAll (admin)', () => {
    it('should return all invoices', async () => {
      mock.onGet('/invoices').reply(200, { items: [mockInvoice], total: 1 });
      const result = await service.getAll({ status: 'paid' });
      expect(result.items.length).toBe(1);
    });

    it('should throw on 403', async () => {
      mock.onGet('/invoices').reply(403);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('syncFromStripe', () => {
    it('should sync invoices', async () => {
      mock.onPost('/invoices/sync').reply(200, { synced: 5, created: 2, updated: 3 });
      const result = await service.syncFromStripe();
      expect(result.synced).toBe(5);
    });
  });

  describe('syncAllFromStripe', () => {
    it('should sync all invoices (admin)', async () => {
      mock.onPost('/invoices/sync-all').reply(200, { synced: 50 });
      const result = await service.syncAllFromStripe();
      expect(result.synced).toBe(50);
    });

    it('should pass filters', async () => {
      mock.onPost('/invoices/sync-all').reply(200, { synced: 10 });
      const result = await service.syncAllFromStripe({ status: 'paid' });
      expect(result.synced).toBe(10);
    });
  });
});
