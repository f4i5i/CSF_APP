/**
 * Unit Tests for src/config/stripe.config.js
 * Tests that the Stripe promise is created with the publishable key
 */

// Mock @stripe/stripe-js before importing
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({ fake: 'stripe' })),
}));

describe('stripe.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should call loadStripe with the publishable key from env', () => {
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY = 'pk_test_abc123';

    const { loadStripe } = require('@stripe/stripe-js');
    // Re-import the module to trigger loadStripe with the current env
    const stripePromise = require('../../../config/stripe.config').default;

    expect(loadStripe).toHaveBeenCalledWith('pk_test_abc123');
    expect(stripePromise).toBeDefined();
  });

  it('should export a default promise', async () => {
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY = 'pk_test_xyz789';

    const stripePromise = require('../../../config/stripe.config').default;

    // The mock returns { fake: 'stripe' }
    const result = await stripePromise;
    expect(result).toEqual({ fake: 'stripe' });
  });

  it('should call loadStripe with undefined if env var is not set', () => {
    delete process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

    const { loadStripe } = require('@stripe/stripe-js');
    require('../../../config/stripe.config');

    expect(loadStripe).toHaveBeenCalledWith(undefined);
  });
});
