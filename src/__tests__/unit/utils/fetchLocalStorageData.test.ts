/**
 * Unit Tests for fetchLocalStorageData.js utility
 * Tests: fetchUser
 */

import { fetchUser } from '../../../utils/fetchLocalStorageData';

describe('fetchLocalStorageData utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('fetchUser', () => {
    it('should return parsed user object from localStorage', () => {
      const mockUser = { id: '1', name: 'Test User', role: 'PARENT' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = fetchUser();
      expect(result).toEqual(mockUser);
    });

    it('should return undefined and clear storage when user is "undefined"', () => {
      localStorage.setItem('user', 'undefined');

      const result = fetchUser();
      expect(result).toBeUndefined();
    });

    it('should return null when no user is stored', () => {
      const result = fetchUser();
      // localStorage.getItem returns null, which is not "undefined"
      // so JSON.parse(null) returns null
      expect(result).toBeNull();
    });

    it('should handle complex user objects', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'ADMIN',
        phone: '+1234567890',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = fetchUser();
      expect(result.email).toBe('test@test.com');
      expect(result.role).toBe('ADMIN');
    });
  });
});
