import type { Class, ClassWithAvailability } from '../api/types/class.types';

export type OfferingType = 'membership' | 'short-term' | 'unknown';

const pickStringField = (source: Record<string, any> | undefined, keys: string[]) => {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const titleCase = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getOfferingType = (
  cls?: Partial<Class> & Record<string, any>
): OfferingType => {
  if (!cls) return 'unknown';

  const stringCandidate = pickStringField(cls, [
    'offering_type',
    'class_type',
    'type',
    'program_type',
    'pricing_model',
    'price_model',
    'billing_type',
    'session_type',
    'enrollment_type',
  ]);

  const normalized = stringCandidate?.toLowerCase() ?? '';

  if (normalized.includes('member') || normalized.includes('subscription') || normalized.includes('recurring')) {
    return 'membership';
  }

  if (
    normalized.includes('short') ||
    normalized.includes('drop') ||
    normalized.includes('camp') ||
    normalized.includes('one-time') ||
    normalized.includes('one time')
  ) {
    return 'short-term';
  }

  if (cls.is_membership || cls.membership_only || cls.recurring || cls.is_recurring) {
    return 'membership';
  }

  if (cls.is_short_term || cls.short_term || cls.one_time_session) {
    return 'short-term';
  }

  if (typeof cls.billing_cycle === 'string' && cls.billing_cycle.toLowerCase().includes('month')) {
    return 'membership';
  }

  if (typeof cls.recurrence === 'string' && !cls.recurrence.toLowerCase().includes('one')) {
    return 'membership';
  }

  return 'unknown';
};

export const getOfferingLabel = (type: OfferingType) => {
  if (type === 'membership') return 'Membership';
  if (type === 'short-term') return 'Short-term';
  return null;
};

export const getPriceModelLabel = (
  cls?: Record<string, any>,
  offeringType: OfferingType = getOfferingType(cls as Class)
) => {
  if (!cls) {
    return offeringType === 'membership' ? 'Membership' : offeringType === 'short-term' ? 'Short-term' : 'Fixed Rate';
  }

  const raw = pickStringField(cls, [
    'pricing_model',
    'price_model',
    'billing_type',
    'payment_model',
    'payment_plan',
    'payment_schedule',
  ]);

  if (raw) {
    return titleCase(raw);
  }

  if (offeringType === 'membership') return 'Membership';
  if (offeringType === 'short-term') return 'Short-term';
  return 'Fixed Rate';
};

export interface CapacityMeta {
  total: number;
  current: number;
  availableSpots: number;
  hasCapacity: boolean;
  waitlistCount: number;
}

export const getCapacityMeta = (
  cls?: Partial<ClassWithAvailability> & Record<string, any>
): CapacityMeta => {
  const totalRaw = cls?.capacity ?? cls?.capacity_total ?? cls?.capacity_limit;
  const total = typeof totalRaw === 'number' ? totalRaw : parseInt(totalRaw ?? '0', 10) || 0;

  const currentRaw = cls?.current_enrollment ?? cls?.capacity_filled ?? cls?.enrollment_count;
  const current = typeof currentRaw === 'number' ? currentRaw : parseInt(currentRaw ?? '0', 10) || 0;

  const availableRaw = cls?.available_spots;
  const computedAvailable = Math.max(total - current, 0);
  const available =
    typeof availableRaw === 'number'
      ? availableRaw
      : typeof availableRaw === 'string'
      ? parseInt(availableRaw, 10) || computedAvailable
      : computedAvailable;

  const hasCapacity =
    typeof cls?.has_capacity === 'boolean'
      ? cls.has_capacity
      : total === 0
      ? true
      : current < total;

  const waitlistRaw = cls?.waitlist_count ?? cls?.waitlist ?? cls?.waitlist_size;
  const waitlistCount = typeof waitlistRaw === 'number' ? waitlistRaw : parseInt(waitlistRaw ?? '0', 10) || 0;

  return {
    total,
    current,
    availableSpots: available,
    hasCapacity,
    waitlistCount,
  };
};

export const getDirectRegistrationLink = (
  classId?: string,
  cls?: Record<string, any>
) => {
  const explicitLink = pickStringField(cls, [
    'registration_link',
    'registration_url',
    'enrollment_link',
    'signup_link',
    'external_registration_url',
  ]);

  if (explicitLink) {
    return explicitLink;
  }

  const base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const suffix = classId ? `/checkout?classId=${classId}` : '/checkout';
  return `${base}${suffix}`;
};

export const getCancellationSummary = (cls?: Record<string, any>) => {
  if (!cls) {
    return 'Cancellations require 24 hours notice. Please contact support for help.';
  }

  const summary =
    cls.cancellation_policy_summary ||
    cls.cancellation_policy ||
    cls.cancellation_terms ||
    (cls.cancellation_window ? `Cancellations allowed ${cls.cancellation_window}.` : undefined);

  return (
    summary ||
    'Cancellations require at least 24 hours notice so we can open the spot to another player.'
  );
};
