/**
 * Admin Service Unit Tests
 * Tests for admin dashboard and management service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const adminServiceModule = require('../../../api/services/admin.service');
const adminService =
  adminServiceModule.adminService ||
  adminServiceModule.default?.adminService ||
  adminServiceModule.default;

const mock = new MockAdapter(apiClient);

const mockMetrics = {
  total_revenue: 150000,
  total_enrollments: 320,
  active_students: 280,
  total_classes: 45,
};

const mockRevenueReport = {
  total: 150000,
  breakdown: [
    { month: '2024-01', revenue: 12000 },
    { month: '2024-02', revenue: 13000 },
  ],
};

const mockClient = {
  id: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@test.com',
  children_count: 2,
};

const mockClientDetail = {
  ...mockClient,
  children: [],
  enrollments: [],
  payments: [],
};

const mockRoster = {
  class_id: 'class-1',
  class_name: 'Soccer 101',
  students: [
    { child_id: 'child-1', first_name: 'Emma', last_name: 'Smith' },
  ],
};

const mockRefund = {
  id: 'refund-1',
  amount: 5000,
  status: 'pending',
  reason: 'Class cancelled',
};

describe('adminService', () => {
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
    it('should have adminService defined', () => {
      expect(adminService).toBeDefined();
      expect(typeof adminService.getDashboardMetrics).toBe('function');
      expect(typeof adminService.getRevenueReport).toBe('function');
      expect(typeof adminService.getClients).toBe('function');
      expect(typeof adminService.getClientById).toBe('function');
      expect(typeof adminService.getClassRoster).toBe('function');
      expect(typeof adminService.getRefunds).toBe('function');
      expect(typeof adminService.approveRefund).toBe('function');
      expect(typeof adminService.rejectRefund).toBe('function');
    });
  });

  // ===========================================
  // GET DASHBOARD METRICS
  // ===========================================
  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics successfully', async () => {
      mock.onGet('/admin/dashboard/metrics').reply(200, mockMetrics);

      const result = await adminService.getDashboardMetrics();

      expect(result).toEqual(mockMetrics);
      expect(result.total_revenue).toBe(150000);
    });

    it('should throw error on 500 server error', async () => {
      mock.onGet('/admin/dashboard/metrics').reply(500, { message: 'Server error' });

      await expect(adminService.getDashboardMetrics()).rejects.toBeDefined();
    });

    it('should throw error on 403 forbidden', async () => {
      mock.onGet('/admin/dashboard/metrics').reply(403, { message: 'Forbidden' });

      await expect(adminService.getDashboardMetrics()).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET REVENUE REPORT
  // ===========================================
  describe('getRevenueReport', () => {
    it('should return revenue report with filters', async () => {
      mock.onGet('/admin/finance/revenue').reply(200, mockRevenueReport);

      const result = await adminService.getRevenueReport({
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(result).toEqual(mockRevenueReport);
      expect(result.total).toBe(150000);
    });

    it('should throw error on 400 bad request', async () => {
      mock.onGet('/admin/finance/revenue').reply(400, { message: 'Invalid date range' });

      await expect(
        adminService.getRevenueReport({ start_date: 'invalid' })
      ).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET CLIENTS
  // ===========================================
  describe('getClients', () => {
    it('should return clients list', async () => {
      mock.onGet('/admin/clients').reply(200, [mockClient]);

      const result = await adminService.getClients();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].first_name).toBe('John');
    });

    it('should return clients with filters', async () => {
      mock.onGet('/admin/clients').reply(200, [mockClient]);

      const result = await adminService.getClients({ search: 'John' });

      expect(result.length).toBe(1);
    });

    it('should return empty array when no clients', async () => {
      mock.onGet('/admin/clients').reply(200, []);

      const result = await adminService.getClients();

      expect(result).toEqual([]);
    });
  });

  // ===========================================
  // GET CLIENT BY ID
  // ===========================================
  describe('getClientById', () => {
    it('should return client detail by ID', async () => {
      mock.onGet('/admin/clients/user-1').reply(200, mockClientDetail);

      const result = await adminService.getClientById('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('john@test.com');
    });

    it('should throw error when client not found', async () => {
      mock.onGet('/admin/clients/nonexistent').reply(404, { message: 'Not found' });

      await expect(adminService.getClientById('nonexistent')).rejects.toBeDefined();
    });

    it('should throw error on 500 server error', async () => {
      mock.onGet('/admin/clients/user-1').reply(500, { message: 'Server error' });

      await expect(adminService.getClientById('user-1')).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET CLASS ROSTER
  // ===========================================
  describe('getClassRoster', () => {
    it('should return class roster', async () => {
      mock.onGet('/admin/classes/class-1/roster').reply(200, mockRoster);

      const result = await adminService.getClassRoster('class-1');

      expect(result.class_id).toBe('class-1');
      expect(result.students.length).toBe(1);
    });

    it('should throw error when class not found', async () => {
      mock.onGet('/admin/classes/bad-id/roster').reply(404, { message: 'Class not found' });

      await expect(adminService.getClassRoster('bad-id')).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET REFUNDS
  // ===========================================
  describe('getRefunds', () => {
    it('should return refund requests', async () => {
      mock.onGet('/admin/refunds/search').reply(200, [mockRefund]);

      const result = await adminService.getRefunds();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].status).toBe('pending');
    });

    it('should return refunds with filters', async () => {
      mock.onGet('/admin/refunds/search').reply(200, [mockRefund]);

      const result = await adminService.getRefunds({ status: 'pending' });

      expect(result.length).toBe(1);
    });

    it('should throw error on 500 server error', async () => {
      mock.onGet('/admin/refunds/search').reply(500, { message: 'Server error' });

      await expect(adminService.getRefunds()).rejects.toBeDefined();
    });

    it('should return empty array when no refunds', async () => {
      mock.onGet('/admin/refunds/search').reply(200, []);

      const result = await adminService.getRefunds();

      expect(result).toEqual([]);
    });
  });

  // ===========================================
  // APPROVE REFUND
  // ===========================================
  describe('approveRefund', () => {
    it('should approve refund successfully', async () => {
      const approvedRefund = { ...mockRefund, status: 'approved' };
      mock.onPost('/admin/refunds/refund-1/approve').reply(200, approvedRefund);

      const result = await adminService.approveRefund('refund-1');

      expect(result.status).toBe('approved');
    });

    it('should throw error when refund not found', async () => {
      mock.onPost('/admin/refunds/bad-id/approve').reply(404, { message: 'Not found' });

      await expect(adminService.approveRefund('bad-id')).rejects.toBeDefined();
    });
  });

  // ===========================================
  // REJECT REFUND
  // ===========================================
  describe('rejectRefund', () => {
    it('should reject refund with reason', async () => {
      const rejectedRefund = { ...mockRefund, status: 'rejected' };
      mock.onPost('/admin/refunds/refund-1/reject').reply(200, rejectedRefund);

      const result = await adminService.rejectRefund('refund-1', 'Policy violation');

      expect(result.status).toBe('rejected');
    });

    it('should throw error on 400 bad request', async () => {
      mock.onPost('/admin/refunds/refund-1/reject').reply(400, { message: 'Reason required' });

      await expect(adminService.rejectRefund('refund-1', '')).rejects.toBeDefined();
    });
  });

  // ===========================================
  // DELETE CLIENT
  // ===========================================
  describe('deleteClient', () => {
    it('should delete client successfully', async () => {
      mock.onDelete('/admin/clients/user-1').reply(200, { message: 'Deleted' });

      const result = await adminService.deleteClient('user-1');

      expect(result.message).toBe('Deleted');
    });

    it('should throw error when client not found', async () => {
      mock.onDelete('/admin/clients/nonexistent').reply(404, { message: 'Not found' });

      await expect(adminService.deleteClient('nonexistent')).rejects.toBeDefined();
    });

    it('should throw error on 403 forbidden', async () => {
      mock.onDelete('/admin/clients/user-1').reply(403, { message: 'Forbidden' });

      await expect(adminService.deleteClient('user-1')).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET COACHES
  // ===========================================
  describe('getCoaches', () => {
    it('should return coaches list', async () => {
      mock.onGet('/admin/coaches').reply(200, [{ id: 'coach-1', name: 'Coach A' }]);

      const result = await adminService.getCoaches();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe('coach-1');
    });

    it('should return empty array when no coaches', async () => {
      mock.onGet('/admin/coaches').reply(200, []);

      const result = await adminService.getCoaches();

      expect(result).toEqual([]);
    });

    it('should throw error on 500', async () => {
      mock.onGet('/admin/coaches').reply(500);

      await expect(adminService.getCoaches()).rejects.toBeDefined();
    });
  });

  // ===========================================
  // GET PENDING REFUNDS
  // ===========================================
  describe('getPendingRefunds', () => {
    it('should return pending refunds', async () => {
      mock.onGet('/admin/refunds/pending').reply(200, { items: [mockRefund] });

      const result = await adminService.getPendingRefunds();

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('pending');
    });

    it('should return empty items when no pending refunds', async () => {
      mock.onGet('/admin/refunds/pending').reply(200, { items: [] });

      const result = await adminService.getPendingRefunds();

      expect(result.items).toEqual([]);
    });
  });

  // ===========================================
  // SEND BULK EMAIL
  // ===========================================
  describe('sendBulkEmail', () => {
    it('should send bulk email successfully', async () => {
      mock.onPost('/admin/bulk/email').reply(200, {
        total_recipients: 50,
        successful: 48,
        failed: 2,
      });

      const result = await adminService.sendBulkEmail({
        recipient_type: 'all',
        subject: 'Newsletter',
        message: 'Hello everyone',
      });

      expect(result.total_recipients).toBe(50);
      expect(result.successful).toBe(48);
      expect(result.failed).toBe(2);
    });

    it('should throw error on 400 validation error', async () => {
      mock.onPost('/admin/bulk/email').reply(400, { message: 'Subject required' });

      await expect(
        adminService.sendBulkEmail({ recipient_type: 'all', message: 'No subject' })
      ).rejects.toBeDefined();
    });

    it('should throw error on 403 forbidden', async () => {
      mock.onPost('/admin/bulk/email').reply(403, { message: 'Not authorized' });

      await expect(
        adminService.sendBulkEmail({ recipient_type: 'all', subject: 'Test', message: 'Hi' })
      ).rejects.toBeDefined();
    });
  });

  // ===========================================
  // SEND SUPPORT LOGS
  // ===========================================
  describe('sendSupportLogs', () => {
    it('should send support logs successfully', async () => {
      mock.onPost('/admin/support/send-logs').reply(200, { message: 'Logs sent' });

      const result = await adminService.sendSupportLogs();

      expect(result.message).toBe('Logs sent');
    });

    it('should throw error on 500', async () => {
      mock.onPost('/admin/support/send-logs').reply(500);

      await expect(adminService.sendSupportLogs()).rejects.toBeDefined();
    });
  });

  // ===========================================
  // CANCELLATION REQUESTS
  // ===========================================
  describe('getCancellationRequests', () => {
    it('should fetch cancellation requests', async () => {
      mock.onGet('/cancellation-requests').reply(200, { items: [], total: 0 });

      const result = await adminService.getCancellationRequests({ status: 'pending' });

      expect(result).toBeDefined();
      expect(result.items).toEqual([]);
    });

    it('should throw error on 500', async () => {
      mock.onGet('/cancellation-requests').reply(500);

      await expect(adminService.getCancellationRequests()).rejects.toBeDefined();
    });
  });

  describe('approveCancellationRequest', () => {
    it('should approve cancellation request', async () => {
      mock.onPost('/cancellation-requests/cr-1/approve').reply(200, { status: 'approved' });

      const result = await adminService.approveCancellationRequest('cr-1', { admin_notes: 'OK' });

      expect(result.status).toBe('approved');
    });

    it('should throw error on 404', async () => {
      mock.onPost('/cancellation-requests/bad-id/approve').reply(404);

      await expect(adminService.approveCancellationRequest('bad-id')).rejects.toBeDefined();
    });
  });

  describe('rejectCancellationRequest', () => {
    it('should reject cancellation request with reason', async () => {
      mock.onPost('/cancellation-requests/cr-1/reject').reply(200, { status: 'rejected' });

      const result = await adminService.rejectCancellationRequest('cr-1', { rejection_reason: 'No' });

      expect(result.status).toBe('rejected');
    });
  });
});
