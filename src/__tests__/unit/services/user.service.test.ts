/**
 * User Service Unit Tests
 * Tests for user profile management service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';
import { userService } from '../../../api/services/user.service';

const mock = new MockAdapter(apiClient);

describe('userService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Set up auth token for authenticated requests
    localStorage.setItem('csf_access_token', 'mock-access-token');
    // Reset mock adapter
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('getMe', () => {
    it('should return current user profile successfully', async () => {
      const mockUser = {
        id: 'user-parent-1',
        email: 'parent@test.com',
        first_name: 'Test',
        last_name: 'Parent',
        role: 'PARENT',
        phone: '+1234567890',
        created_at: '2024-01-01T00:00:00Z',
      };

      mock.onGet('/users/me').reply(200, mockUser);

      const result = await userService.getMe();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('first_name');
      expect(result).toHaveProperty('last_name');
      expect(result).toHaveProperty('role');
    });

    it('should return user with parent role', async () => {
      mock.onGet('/users/me').reply(200, {
        id: 'user-parent-1',
        email: 'parent@test.com',
        first_name: 'Test',
        last_name: 'Parent',
        role: 'PARENT',
        phone: '+1234567890',
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = await userService.getMe();

      expect(result.role).toBe('PARENT');
      expect(result.email).toBe('parent@test.com');
    });

    it('should return user with admin role', async () => {
      mock.onGet('/users/me').reply(200, {
        id: 'user-admin-1',
        email: 'admin@test.com',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'ADMIN',
        phone: '+1234567892',
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = await userService.getMe();

      expect(result.role).toBe('ADMIN');
      expect(result.email).toBe('admin@test.com');
    });

    it('should return user with coach role', async () => {
      mock.onGet('/users/me').reply(200, {
        id: 'user-coach-1',
        email: 'coach@test.com',
        first_name: 'Test',
        last_name: 'Coach',
        role: 'COACH',
        phone: '+1234567891',
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = await userService.getMe();

      expect(result.role).toBe('COACH');
      expect(result.email).toBe('coach@test.com');
    });

    it('should throw error on 401 unauthorized', async () => {
      localStorage.removeItem('csf_access_token');
      mock.onGet('/users/me').reply(401, { message: 'Unauthorized' });

      await expect(userService.getMe()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/users/me').networkError();

      await expect(userService.getMe()).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      mock.onGet('/users/me').reply(500, { message: 'Internal Server Error' });

      await expect(userService.getMe()).rejects.toThrow();
    });
  });

  describe('updateMe', () => {
    it('should update user first name successfully', async () => {
      mock.onPut('/users/me').reply((config) => {
        const data = JSON.parse(config.data);
        return [200, {
          id: 'user-parent-1',
          email: 'parent@test.com',
          first_name: data.first_name || 'Test',
          last_name: 'Parent',
          role: 'PARENT',
          phone: '+1234567890',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await userService.updateMe({
        first_name: 'UpdatedFirstName',
      });

      expect(result.first_name).toBe('UpdatedFirstName');
    });

    it('should update user last name successfully', async () => {
      mock.onPut('/users/me').reply((config) => {
        const data = JSON.parse(config.data);
        return [200, {
          id: 'user-parent-1',
          email: 'parent@test.com',
          first_name: 'Test',
          last_name: data.last_name || 'Parent',
          role: 'PARENT',
          phone: '+1234567890',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await userService.updateMe({
        last_name: 'UpdatedLastName',
      });

      expect(result.last_name).toBe('UpdatedLastName');
    });

    it('should update multiple fields at once', async () => {
      mock.onPut('/users/me').reply((config) => {
        const data = JSON.parse(config.data);
        return [200, {
          id: 'user-parent-1',
          email: 'parent@test.com',
          first_name: data.first_name || 'Test',
          last_name: data.last_name || 'Parent',
          role: 'PARENT',
          phone: data.phone_number || '+1234567890',
          phone_number: data.phone_number || '+1234567890',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await userService.updateMe({
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1-555-987-6543',
      });

      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.phone_number).toBe('+1-555-987-6543');
    });

    it('should throw error on validation failure', async () => {
      mock.onPut('/users/me').reply(400, { message: 'Invalid phone number format' });

      await expect(
        userService.updateMe({
          phone_number: 'invalid-phone',
        })
      ).rejects.toThrow();
    });

    it('should throw error on 401 unauthorized', async () => {
      localStorage.removeItem('csf_access_token');
      mock.onPut('/users/me').reply(401, { message: 'Unauthorized' });

      await expect(
        userService.updateMe({
          first_name: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onPut('/users/me').networkError();

      await expect(
        userService.updateMe({
          first_name: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      mock.onPut('/users/me').reply(500, { message: 'Internal Server Error' });

      await expect(
        userService.updateMe({
          first_name: 'Test',
        })
      ).rejects.toThrow();
    });
  });
});
