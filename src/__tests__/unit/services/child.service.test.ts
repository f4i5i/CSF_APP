/**
 * Child Service Unit Tests
 * Tests for child/student management service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';
import { childService } from '../../../api/services/child.service';

const mock = new MockAdapter(apiClient);

const mockChild = {
  id: 'child-1',
  parent_id: 'user-parent-1',
  first_name: 'Johnny',
  last_name: 'Parent',
  date_of_birth: '2015-05-15',
  grade_level: '3rd Grade',
  medical_info: 'No allergies',
  emergency_contacts: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockEmergencyContact = {
  id: 'contact-1',
  child_id: 'child-1',
  name: 'Jane Parent',
  relationship: 'Mother',
  phone_number: '+1-555-123-4567',
  email: 'jane@test.com',
  is_primary: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('childService', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // GET MY CHILDREN TESTS
  // ===========================================
  describe('getMy', () => {
    it('should return list of user children successfully', async () => {
      mock.onGet('/children/my').reply(200, [mockChild]);

      const result = await childService.getMy();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('first_name');
    });

    it('should return empty array when user has no children', async () => {
      mock.onGet('/children/my').reply(200, []);

      const result = await childService.getMy();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return multiple children', async () => {
      mock.onGet('/children/my').reply(200, [
        mockChild,
        { ...mockChild, id: 'child-2', first_name: 'Jenny' },
      ]);

      const result = await childService.getMy();

      expect(result.length).toBe(2);
      expect(result[0].first_name).toBe('Johnny');
      expect(result[1].first_name).toBe('Jenny');
    });

    it('should throw error on 401 unauthorized', async () => {
      mock.onGet('/children/my').reply(401, { message: 'Unauthorized' });

      await expect(childService.getMy()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/children/my').networkError();

      await expect(childService.getMy()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET CHILD BY ID TESTS
  // ===========================================
  describe('getById', () => {
    it('should return child by ID successfully', async () => {
      mock.onGet('/children/child-1').reply(200, mockChild);

      const result = await childService.getById('child-1');

      expect(result.id).toBe('child-1');
      expect(result.first_name).toBe('Johnny');
      expect(result.last_name).toBe('Parent');
    });

    it('should throw error when child not found', async () => {
      mock.onGet('/children/nonexistent-id').reply(404, { message: 'Child not found' });

      await expect(childService.getById('nonexistent-id')).rejects.toThrow();
    });

    it('should throw error when user is not parent of child', async () => {
      mock.onGet('/children/other-child').reply(403, { message: 'Forbidden' });

      await expect(childService.getById('other-child')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE CHILD TESTS
  // ===========================================
  describe('create', () => {
    it('should create child successfully', async () => {
      mock.onPost('/children').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-child-id',
          parent_id: 'user-parent-1',
          first_name: body.first_name,
          last_name: body.last_name,
          date_of_birth: body.date_of_birth,
          grade_level: body.grade_level || null,
          medical_info: body.medical_info || null,
          emergency_contacts: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.create({
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2016-06-15',
      });

      expect(result.id).toBe('new-child-id');
      expect(result.first_name).toBe('Emma');
      expect(result.last_name).toBe('Smith');
    });

    it('should create child with all optional fields', async () => {
      mock.onPost('/children').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-child-id',
          parent_id: 'user-parent-1',
          first_name: body.first_name,
          last_name: body.last_name,
          date_of_birth: body.date_of_birth,
          grade_level: body.grade_level,
          medical_info: body.medical_info,
          emergency_contacts: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.create({
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2016-06-15',
        grade_level: '2nd Grade',
        medical_info: 'Allergic to peanuts',
      });

      expect(result.grade_level).toBe('2nd Grade');
      expect(result.medical_info).toBe('Allergic to peanuts');
    });

    it('should throw error on validation failure', async () => {
      mock.onPost('/children').reply(400, { message: 'Invalid date of birth' });

      await expect(
        childService.create({
          first_name: 'Emma',
          last_name: 'Smith',
          date_of_birth: 'invalid-date',
        })
      ).rejects.toThrow();
    });

    it('should throw error on 401 unauthorized', async () => {
      mock.onPost('/children').reply(401, { message: 'Unauthorized' });

      await expect(
        childService.create({
          first_name: 'Emma',
          last_name: 'Smith',
          date_of_birth: '2016-06-15',
        })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE CHILD TESTS
  // ===========================================
  describe('update', () => {
    it('should update child successfully', async () => {
      mock.onPut('/children/child-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockChild,
          grade_level: body.grade_level || mockChild.grade_level,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.update('child-1', {
        grade_level: '4th Grade',
      });

      expect(result.grade_level).toBe('4th Grade');
    });

    it('should update multiple fields', async () => {
      mock.onPut('/children/child-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockChild,
          first_name: body.first_name || mockChild.first_name,
          grade_level: body.grade_level || mockChild.grade_level,
          medical_info: body.medical_info || mockChild.medical_info,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.update('child-1', {
        first_name: 'John',
        grade_level: '4th Grade',
        medical_info: 'Updated medical info',
      });

      expect(result.first_name).toBe('John');
      expect(result.grade_level).toBe('4th Grade');
      expect(result.medical_info).toBe('Updated medical info');
    });

    it('should throw error when child not found', async () => {
      mock.onPut('/children/nonexistent-id').reply(404, { message: 'Child not found' });

      await expect(
        childService.update('nonexistent-id', { grade_level: '4th Grade' })
      ).rejects.toThrow();
    });

    it('should throw error when user is not parent', async () => {
      mock.onPut('/children/other-child').reply(403, { message: 'Forbidden' });

      await expect(
        childService.update('other-child', { grade_level: '4th Grade' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // DELETE CHILD TESTS
  // ===========================================
  describe('delete', () => {
    it('should delete child successfully', async () => {
      mock.onDelete('/children/child-1').reply(200, {
        message: 'Child deleted successfully',
      });

      const result = await childService.delete('child-1');

      expect(result.message).toBe('Child deleted successfully');
    });

    it('should throw error when child not found', async () => {
      mock.onDelete('/children/nonexistent-id').reply(404, { message: 'Child not found' });

      await expect(childService.delete('nonexistent-id')).rejects.toThrow();
    });

    it('should throw error when child has active enrollments', async () => {
      mock.onDelete('/children/child-1').reply(400, {
        message: 'Cannot delete child with active enrollments',
      });

      await expect(childService.delete('child-1')).rejects.toThrow();
    });

    it('should throw error when user is not parent', async () => {
      mock.onDelete('/children/other-child').reply(403, { message: 'Forbidden' });

      await expect(childService.delete('other-child')).rejects.toThrow();
    });
  });

  // ===========================================
  // EMERGENCY CONTACTS TESTS
  // ===========================================
  describe('getEmergencyContacts', () => {
    it('should return emergency contacts for child', async () => {
      mock.onGet('/children/child-1/emergency-contacts').reply(200, [mockEmergencyContact]);

      const result = await childService.getEmergencyContacts('child-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Jane Parent');
      expect(result[0].is_primary).toBe(true);
    });

    it('should return empty array when no contacts', async () => {
      mock.onGet('/children/child-1/emergency-contacts').reply(200, []);

      const result = await childService.getEmergencyContacts('child-1');

      expect(result).toEqual([]);
    });

    it('should throw error when child not found', async () => {
      mock.onGet('/children/nonexistent-id/emergency-contacts').reply(404, {
        message: 'Child not found',
      });

      await expect(
        childService.getEmergencyContacts('nonexistent-id')
      ).rejects.toThrow();
    });
  });

  describe('addEmergencyContact', () => {
    it('should add emergency contact successfully', async () => {
      mock.onPost('/children/child-1/emergency-contacts').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-contact-id',
          child_id: 'child-1',
          name: body.name,
          relationship: body.relationship,
          phone_number: body.phone_number,
          email: body.email || null,
          is_primary: body.is_primary || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.addEmergencyContact('child-1', {
        name: 'John Parent',
        relationship: 'Father',
        phone_number: '+1-555-987-6543',
        is_primary: false,
      });

      expect(result.id).toBe('new-contact-id');
      expect(result.name).toBe('John Parent');
      expect(result.relationship).toBe('Father');
    });

    it('should add primary emergency contact', async () => {
      mock.onPost('/children/child-1/emergency-contacts').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-contact-id',
          child_id: 'child-1',
          name: body.name,
          relationship: body.relationship,
          phone_number: body.phone_number,
          email: body.email,
          is_primary: body.is_primary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.addEmergencyContact('child-1', {
        name: 'Jane Parent',
        relationship: 'Mother',
        phone_number: '+1-555-123-4567',
        email: 'jane@test.com',
        is_primary: true,
      });

      expect(result.is_primary).toBe(true);
      expect(result.email).toBe('jane@test.com');
    });

    it('should throw error on validation failure', async () => {
      mock.onPost('/children/child-1/emergency-contacts').reply(400, {
        message: 'Invalid phone number',
      });

      await expect(
        childService.addEmergencyContact('child-1', {
          name: 'Jane Parent',
          relationship: 'Mother',
          phone_number: 'invalid',
        })
      ).rejects.toThrow();
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update emergency contact successfully', async () => {
      mock.onPut('/children/child-1/emergency-contacts/contact-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockEmergencyContact,
          phone_number: body.phone_number || mockEmergencyContact.phone_number,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.updateEmergencyContact(
        'child-1',
        'contact-1',
        { phone_number: '+1-555-NEW-NUMBER' }
      );

      expect(result.phone_number).toBe('+1-555-NEW-NUMBER');
    });

    it('should update multiple fields', async () => {
      mock.onPut('/children/child-1/emergency-contacts/contact-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockEmergencyContact,
          name: body.name || mockEmergencyContact.name,
          email: body.email || mockEmergencyContact.email,
          is_primary: body.is_primary !== undefined ? body.is_primary : mockEmergencyContact.is_primary,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await childService.updateEmergencyContact(
        'child-1',
        'contact-1',
        {
          name: 'Jane Doe',
          email: 'jane.doe@newemail.com',
          is_primary: true,
        }
      );

      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane.doe@newemail.com');
      expect(result.is_primary).toBe(true);
    });

    it('should throw error when contact not found', async () => {
      mock.onPut('/children/child-1/emergency-contacts/nonexistent').reply(404, {
        message: 'Contact not found',
      });

      await expect(
        childService.updateEmergencyContact('child-1', 'nonexistent', {
          phone_number: '+1-555-123-4567',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete emergency contact successfully', async () => {
      mock.onDelete('/children/child-1/emergency-contacts/contact-1').reply(200, {
        message: 'Emergency contact deleted successfully',
      });

      const result = await childService.deleteEmergencyContact('child-1', 'contact-1');

      expect(result.message).toBe('Emergency contact deleted successfully');
    });

    it('should throw error when contact not found', async () => {
      mock.onDelete('/children/child-1/emergency-contacts/nonexistent').reply(404, {
        message: 'Contact not found',
      });

      await expect(
        childService.deleteEmergencyContact('child-1', 'nonexistent')
      ).rejects.toThrow();
    });

    it('should throw error when trying to delete only contact', async () => {
      mock.onDelete('/children/child-1/emergency-contacts/contact-1').reply(400, {
        message: 'Cannot remove the only emergency contact',
      });

      await expect(
        childService.deleteEmergencyContact('child-1', 'contact-1')
      ).rejects.toThrow();
    });
  });
});
