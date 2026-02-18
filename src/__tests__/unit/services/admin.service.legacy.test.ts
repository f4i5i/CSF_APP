/**
 * Admin Service Legacy (JS) Unit Tests
 * Tests for admin dashboard, clients, refunds, cancellation requests, and bulk operations
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const adminModule = require('../../../api/services/admin.service.js');
const adminService = adminModule.default || adminModule;

const mock = new MockAdapter(apiClient);

describe('adminService (legacy JS)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-token');
    mock.reset();
  });

  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all expected methods', () => {
      expect(adminService).toBeDefined();
      expect(typeof adminService.getDashboardMetrics).toBe('function');
      expect(typeof adminService.getRevenueReport).toBe('function');
      expect(typeof adminService.getClients).toBe('function');
      expect(typeof adminService.getClientById).toBe('function');
      expect(typeof adminService.deleteClient).toBe('function');
      expect(typeof adminService.getCoaches).toBe('function');
      expect(typeof adminService.getClassRoster).toBe('function');
      expect(typeof adminService.getRefunds).toBe('function');
      expect(typeof adminService.getPendingRefunds).toBe('function');
      expect(typeof adminService.approveRefund).toBe('function');
      expect(typeof adminService.rejectRefund).toBe('function');
      expect(typeof adminService.getCancellationRequests).toBe('function');
      expect(typeof adminService.getPendingCancellationRequests).toBe('function');
      expect(typeof adminService.getCancellationRequestById).toBe('function');
      expect(typeof adminService.approveCancellationRequest).toBe('function');
      expect(typeof adminService.rejectCancellationRequest).toBe('function');
      expect(typeof adminService.getCancellationRequestStats).toBe('function');
      expect(typeof adminService.getRefundedInvoices).toBe('function');
      expect(typeof adminService.getInvoiceStats).toBe('function');
      expect(typeof adminService.sendSupportLogs).toBe('function');
      expect(typeof adminService.sendBulkEmail).toBe('function');
    });
  });

  describe('getDashboardMetrics', () => {
    it('should fetch metrics from /admin/dashboard/metrics', async () => {
      const metrics = { total_revenue: 50000, active_students: 100 };
      mock.onGet('/admin/dashboard/metrics').reply(200, metrics);
      const result = await adminService.getDashboardMetrics();
      expect(result).toEqual(metrics);
    });

    it('should throw on 500', async () => {
      mock.onGet('/admin/dashboard/metrics').reply(500);
      await expect(adminService.getDashboardMetrics()).rejects.toBeDefined();
    });
  });

  describe('getRevenueReport', () => {
    it('should fetch revenue with params', async () => {
      const report = { total: 50000 };
      mock.onGet('/admin/finance/revenue').reply(200, report);
      const result = await adminService.getRevenueReport({ start_date: '2024-01-01' });
      expect(result).toEqual(report);
    });
  });

  describe('getClients', () => {
    it('should fetch clients list', async () => {
      mock.onGet('/admin/clients').reply(200, { items: [], total: 0 });
      const result = await adminService.getClients({ search: 'John' });
      expect(result).toBeDefined();
    });
  });

  describe('getClientById', () => {
    it('should fetch client by ID', async () => {
      mock.onGet('/admin/clients/c1').reply(200, { id: 'c1', name: 'John' });
      const result = await adminService.getClientById('c1');
      expect(result.id).toBe('c1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/admin/clients/bad').reply(404);
      await expect(adminService.getClientById('bad')).rejects.toBeDefined();
    });
  });

  describe('deleteClient', () => {
    it('should delete client', async () => {
      mock.onDelete('/admin/clients/c1').reply(200, { message: 'Deleted' });
      const result = await adminService.deleteClient('c1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('getCoaches', () => {
    it('should fetch coaches list', async () => {
      mock.onGet('/admin/coaches').reply(200, [{ id: 'coach-1' }]);
      const result = await adminService.getCoaches();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getClassRoster', () => {
    it('should fetch roster for class', async () => {
      mock.onGet('/admin/classes/cls-1/roster').reply(200, { students: [] });
      const result = await adminService.getClassRoster('cls-1');
      expect(result.students).toBeDefined();
    });
  });

  describe('getRefunds', () => {
    it('should fetch refunds from search endpoint', async () => {
      mock.onGet('/admin/refunds/search').reply(200, { items: [], total: 0 });
      const result = await adminService.getRefunds({ payment_status: 'refunded' });
      expect(result).toBeDefined();
    });
  });

  describe('getPendingRefunds', () => {
    it('should fetch pending refunds', async () => {
      mock.onGet('/admin/refunds/pending').reply(200, { items: [] });
      const result = await adminService.getPendingRefunds();
      expect(result).toBeDefined();
    });
  });

  describe('approveRefund', () => {
    it('should approve refund', async () => {
      mock.onPost('/admin/refunds/pay-1/approve').reply(200, { status: 'approved' });
      const result = await adminService.approveRefund('pay-1');
      expect(result.status).toBe('approved');
    });
  });

  describe('rejectRefund', () => {
    it('should reject refund with reason', async () => {
      mock.onPost('/admin/refunds/pay-1/reject').reply(200, { status: 'rejected' });
      const result = await adminService.rejectRefund('pay-1', 'Policy');
      expect(result.status).toBe('rejected');
    });
  });

  describe('getCancellationRequests', () => {
    it('should fetch cancellation requests', async () => {
      mock.onGet('/cancellation-requests').reply(200, { items: [] });
      const result = await adminService.getCancellationRequests({ status: 'pending' });
      expect(result).toBeDefined();
    });
  });

  describe('getPendingCancellationRequests', () => {
    it('should fetch pending cancellation requests', async () => {
      mock.onGet('/cancellation-requests/pending').reply(200, { items: [] });
      const result = await adminService.getPendingCancellationRequests();
      expect(result).toBeDefined();
    });
  });

  describe('getCancellationRequestById', () => {
    it('should fetch by ID', async () => {
      mock.onGet('/cancellation-requests/cr-1').reply(200, { id: 'cr-1' });
      const result = await adminService.getCancellationRequestById('cr-1');
      expect(result.id).toBe('cr-1');
    });
  });

  describe('approveCancellationRequest', () => {
    it('should approve request', async () => {
      mock.onPost('/cancellation-requests/cr-1/approve').reply(200, { status: 'approved' });
      const result = await adminService.approveCancellationRequest('cr-1', { admin_notes: 'OK' });
      expect(result.status).toBe('approved');
    });
  });

  describe('rejectCancellationRequest', () => {
    it('should reject request with reason', async () => {
      mock.onPost('/cancellation-requests/cr-1/reject').reply(200, { status: 'rejected' });
      const result = await adminService.rejectCancellationRequest('cr-1', { rejection_reason: 'No' });
      expect(result.status).toBe('rejected');
    });
  });

  describe('getCancellationRequestStats', () => {
    it('should get stats', async () => {
      mock.onGet('/cancellation-requests/stats/summary').reply(200, { total: 10, pending: 3 });
      const result = await adminService.getCancellationRequestStats();
      expect(result.total).toBe(10);
    });
  });

  describe('getRefundedInvoices', () => {
    it('should fetch refunded invoices', async () => {
      mock.onGet('/admin/invoices/refunded').reply(200, { items: [] });
      const result = await adminService.getRefundedInvoices();
      expect(result).toBeDefined();
    });
  });

  describe('getInvoiceStats', () => {
    it('should fetch invoice stats', async () => {
      mock.onGet('/admin/invoices/stats').reply(200, { total: 100 });
      const result = await adminService.getInvoiceStats();
      expect(result.total).toBe(100);
    });
  });

  describe('sendSupportLogs', () => {
    it('should send support logs', async () => {
      mock.onPost('/admin/support/send-logs').reply(200, { message: 'Sent' });
      const result = await adminService.sendSupportLogs();
      expect(result.message).toBe('Sent');
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk email', async () => {
      mock.onPost('/admin/bulk/email').reply(200, { total_recipients: 50, successful: 50, failed: 0 });
      const result = await adminService.sendBulkEmail({
        recipient_type: 'all',
        subject: 'Test',
        message: 'Hello',
      });
      expect(result.successful).toBe(50);
    });
  });
});
