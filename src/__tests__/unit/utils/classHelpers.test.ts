/**
 * Unit Tests for classHelpers.ts utility functions
 * Tests: getOfferingType, getOfferingLabel, getPriceModelLabel, getCapacityMeta,
 *        getDirectRegistrationLink, getCancellationSummary
 */

import {
  getOfferingType,
  getOfferingLabel,
  getPriceModelLabel,
  getCapacityMeta,
  getDirectRegistrationLink,
  getCancellationSummary,
} from '../../../utils/classHelpers';

describe('classHelpers utilities', () => {
  // ==========================================
  // getOfferingType
  // ==========================================
  describe('getOfferingType', () => {
    it('should return "unknown" for undefined class', () => {
      expect(getOfferingType(undefined)).toBe('unknown');
    });

    it('should return "unknown" for empty object', () => {
      expect(getOfferingType({})).toBe('unknown');
    });

    it('should return "membership" for offering_type containing "member"', () => {
      expect(getOfferingType({ offering_type: 'membership' })).toBe('membership');
    });

    it('should return "membership" for subscription type', () => {
      expect(getOfferingType({ class_type: 'subscription' })).toBe('membership');
    });

    it('should return "membership" for recurring type', () => {
      expect(getOfferingType({ type: 'recurring' })).toBe('membership');
    });

    it('should return "short-term" for short type', () => {
      expect(getOfferingType({ offering_type: 'short-term' })).toBe('short-term');
    });

    it('should return "short-term" for drop-in type', () => {
      expect(getOfferingType({ class_type: 'drop-in' })).toBe('short-term');
    });

    it('should return "short-term" for camp type', () => {
      expect(getOfferingType({ type: 'camp' })).toBe('short-term');
    });

    it('should return "short-term" for one-time type', () => {
      expect(getOfferingType({ pricing_model: 'one-time' })).toBe('short-term');
    });

    it('should return "short-term" for "one time" (no hyphen)', () => {
      expect(getOfferingType({ billing_type: 'one time' })).toBe('short-term');
    });

    it('should return "membership" for is_membership boolean flag', () => {
      expect(getOfferingType({ is_membership: true })).toBe('membership');
    });

    it('should return "membership" for membership_only flag', () => {
      expect(getOfferingType({ membership_only: true })).toBe('membership');
    });

    it('should return "membership" for recurring flag', () => {
      expect(getOfferingType({ recurring: true })).toBe('membership');
    });

    it('should return "membership" for is_recurring flag', () => {
      expect(getOfferingType({ is_recurring: true })).toBe('membership');
    });

    it('should return "short-term" for is_short_term flag', () => {
      expect(getOfferingType({ is_short_term: true })).toBe('short-term');
    });

    it('should return "short-term" for short_term flag', () => {
      expect(getOfferingType({ short_term: true })).toBe('short-term');
    });

    it('should return "short-term" for one_time_session flag', () => {
      expect(getOfferingType({ one_time_session: true })).toBe('short-term');
    });

    it('should return "membership" for monthly billing cycle', () => {
      expect(getOfferingType({ billing_cycle: 'monthly' })).toBe('membership');
    });

    it('should return "membership" for recurrence that is not "one"', () => {
      expect(getOfferingType({ recurrence: 'weekly' })).toBe('membership');
    });

    it('should return "unknown" for recurrence that includes "one"', () => {
      expect(getOfferingType({ recurrence: 'one-off' })).toBe('unknown');
    });

    it('should check fields in priority order (string fields first)', () => {
      // offering_type takes priority over boolean flags
      expect(getOfferingType({ offering_type: 'membership', is_short_term: true })).toBe('membership');
    });
  });

  // ==========================================
  // getOfferingLabel
  // ==========================================
  describe('getOfferingLabel', () => {
    it('should return "Membership" for membership type', () => {
      expect(getOfferingLabel('membership')).toBe('Membership');
    });

    it('should return "Short-term" for short-term type', () => {
      expect(getOfferingLabel('short-term')).toBe('Short-term');
    });

    it('should return null for unknown type', () => {
      expect(getOfferingLabel('unknown')).toBeNull();
    });
  });

  // ==========================================
  // getPriceModelLabel
  // ==========================================
  describe('getPriceModelLabel', () => {
    it('should return "Membership" when no class and offering is membership', () => {
      expect(getPriceModelLabel(undefined, 'membership')).toBe('Membership');
    });

    it('should return "Short-term" when no class and offering is short-term', () => {
      expect(getPriceModelLabel(undefined, 'short-term')).toBe('Short-term');
    });

    it('should return "Fixed Rate" when no class and offering is unknown', () => {
      expect(getPriceModelLabel(undefined, 'unknown')).toBe('Fixed Rate');
    });

    it('should titleCase the pricing_model from class', () => {
      expect(getPriceModelLabel({ pricing_model: 'monthly_subscription' })).toBe('Monthly Subscription');
    });

    it('should use price_model field', () => {
      expect(getPriceModelLabel({ price_model: 'weekly-plan' })).toBe('Weekly Plan');
    });

    it('should fall back to offering type labels when no string fields found', () => {
      expect(getPriceModelLabel({ is_membership: true })).toBe('Membership');
    });

    it('should fall back to "Fixed Rate" for empty class', () => {
      expect(getPriceModelLabel({})).toBe('Fixed Rate');
    });
  });

  // ==========================================
  // getCapacityMeta
  // ==========================================
  describe('getCapacityMeta', () => {
    it('should return zeros for undefined class', () => {
      const meta = getCapacityMeta(undefined);
      expect(meta.total).toBe(0);
      expect(meta.current).toBe(0);
      expect(meta.availableSpots).toBe(0);
      expect(meta.hasCapacity).toBe(true); // total=0 means unlimited
      expect(meta.waitlistCount).toBe(0);
    });

    it('should compute capacity from capacity field', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 15 });
      expect(meta.total).toBe(20);
      expect(meta.current).toBe(15);
      expect(meta.availableSpots).toBe(5);
      expect(meta.hasCapacity).toBe(true);
    });

    it('should detect full capacity', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 20 });
      expect(meta.hasCapacity).toBe(false);
      expect(meta.availableSpots).toBe(0);
    });

    it('should detect over-capacity', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 25 });
      expect(meta.hasCapacity).toBe(false);
      expect(meta.availableSpots).toBe(0); // Math.max(total - current, 0)
    });

    it('should use capacity_total as fallback', () => {
      const meta = getCapacityMeta({ capacity_total: 30 });
      expect(meta.total).toBe(30);
    });

    it('should use capacity_limit as fallback', () => {
      const meta = getCapacityMeta({ capacity_limit: 25 });
      expect(meta.total).toBe(25);
    });

    it('should use capacity_filled for current enrollment', () => {
      const meta = getCapacityMeta({ capacity: 20, capacity_filled: 10 });
      expect(meta.current).toBe(10);
    });

    it('should use enrollment_count for current enrollment', () => {
      const meta = getCapacityMeta({ capacity: 20, enrollment_count: 12 });
      expect(meta.current).toBe(12);
    });

    it('should parse string capacity values', () => {
      const meta = getCapacityMeta({ capacity: '20', current_enrollment: '15' } as any);
      expect(meta.total).toBe(20);
      expect(meta.current).toBe(15);
    });

    it('should use available_spots when provided as number', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 15, available_spots: 3 });
      expect(meta.availableSpots).toBe(3); // uses provided value, not computed
    });

    it('should parse string available_spots', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 15, available_spots: '3' } as any);
      expect(meta.availableSpots).toBe(3);
    });

    it('should use has_capacity boolean when provided', () => {
      const meta = getCapacityMeta({ capacity: 20, current_enrollment: 15, has_capacity: false });
      expect(meta.hasCapacity).toBe(false);
    });

    it('should compute waitlist count', () => {
      const meta = getCapacityMeta({ waitlist_count: 5 });
      expect(meta.waitlistCount).toBe(5);
    });

    it('should use waitlist as fallback for waitlist count', () => {
      const meta = getCapacityMeta({ waitlist: 3 });
      expect(meta.waitlistCount).toBe(3);
    });

    it('should use waitlist_size as fallback', () => {
      const meta = getCapacityMeta({ waitlist_size: 7 });
      expect(meta.waitlistCount).toBe(7);
    });

    it('should treat total=0 as unlimited (hasCapacity=true)', () => {
      const meta = getCapacityMeta({ capacity: 0, current_enrollment: 5 });
      expect(meta.hasCapacity).toBe(true);
    });
  });

  // ==========================================
  // getDirectRegistrationLink
  // ==========================================
  describe('getDirectRegistrationLink', () => {
    it('should return explicit registration_link when present', () => {
      const link = getDirectRegistrationLink('class-1', { registration_link: 'https://example.com/register' });
      expect(link).toBe('https://example.com/register');
    });

    it('should return explicit registration_url when present', () => {
      const link = getDirectRegistrationLink('class-1', { registration_url: 'https://example.com/signup' });
      expect(link).toBe('https://example.com/signup');
    });

    it('should generate checkout link with classId when no explicit link', () => {
      const link = getDirectRegistrationLink('class-123', {});
      expect(link).toContain('/checkout?classId=class-123');
    });

    it('should generate checkout link without classId when classId is undefined', () => {
      const link = getDirectRegistrationLink(undefined, {});
      expect(link).toContain('/checkout');
    });

    it('should handle undefined class object', () => {
      const link = getDirectRegistrationLink('class-1', undefined);
      expect(link).toContain('/checkout?classId=class-1');
    });
  });

  // ==========================================
  // getCancellationSummary
  // ==========================================
  describe('getCancellationSummary', () => {
    it('should return default summary for undefined class', () => {
      const result = getCancellationSummary(undefined);
      expect(result).toBe('Cancellations require 24 hours notice. Please contact support for help.');
    });

    it('should return cancellation_policy_summary when present', () => {
      const result = getCancellationSummary({ cancellation_policy_summary: 'No refunds after 48 hours.' });
      expect(result).toBe('No refunds after 48 hours.');
    });

    it('should fall back to cancellation_policy', () => {
      const result = getCancellationSummary({ cancellation_policy: 'Full refund within 7 days.' });
      expect(result).toBe('Full refund within 7 days.');
    });

    it('should fall back to cancellation_terms', () => {
      const result = getCancellationSummary({ cancellation_terms: 'See terms.' });
      expect(result).toBe('See terms.');
    });

    it('should use cancellation_window to build summary', () => {
      const result = getCancellationSummary({ cancellation_window: 'up to 24 hours before class' });
      expect(result).toBe('Cancellations allowed up to 24 hours before class.');
    });

    it('should return default fallback for class with no cancellation info', () => {
      const result = getCancellationSummary({});
      expect(result).toMatch(/24 hours notice/);
    });
  });
});
