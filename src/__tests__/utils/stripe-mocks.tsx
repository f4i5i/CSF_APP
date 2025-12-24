/**
 * Stripe Mocks for Testing
 * Mock implementations of Stripe.js and @stripe/react-stripe-js
 */

import React from 'react';

// ==========================================
// MOCK STRIPE INSTANCE
// ==========================================

export const mockStripeElement = {
  mount: jest.fn(),
  destroy: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  update: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  clear: jest.fn(),
};

export const mockStripeElements = {
  create: jest.fn(() => mockStripeElement),
  getElement: jest.fn(() => mockStripeElement),
  update: jest.fn(),
};

export const mockStripe = {
  elements: jest.fn(() => mockStripeElements),
  createToken: jest.fn(() =>
    Promise.resolve({
      token: { id: 'tok_mock_12345' },
    })
  ),
  createPaymentMethod: jest.fn(() =>
    Promise.resolve({
      paymentMethod: {
        id: 'pm_mock_12345',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
        },
      },
    })
  ),
  confirmCardPayment: jest.fn(() =>
    Promise.resolve({
      paymentIntent: {
        id: 'pi_mock_12345',
        status: 'succeeded',
        amount: 15000,
        currency: 'usd',
      },
    })
  ),
  confirmPayment: jest.fn(() =>
    Promise.resolve({
      paymentIntent: {
        id: 'pi_mock_12345',
        status: 'succeeded',
        amount: 15000,
        currency: 'usd',
      },
    })
  ),
  confirmCardSetup: jest.fn(() =>
    Promise.resolve({
      setupIntent: {
        id: 'seti_mock_12345',
        status: 'succeeded',
        payment_method: 'pm_mock_12345',
      },
    })
  ),
  retrievePaymentIntent: jest.fn(() =>
    Promise.resolve({
      paymentIntent: {
        id: 'pi_mock_12345',
        status: 'succeeded',
      },
    })
  ),
};

// ==========================================
// MOCK FACTORIES
// ==========================================

/**
 * Create a mock Stripe instance with custom behavior
 */
export const createMockStripe = (overrides = {}) => ({
  ...mockStripe,
  ...overrides,
});

/**
 * Create mock Stripe elements with custom behavior
 */
export const createMockElements = (overrides = {}) => ({
  ...mockStripeElements,
  ...overrides,
});

// ==========================================
// MOCK RESPONSES
// ==========================================

export const mockSuccessfulPayment = {
  paymentIntent: {
    id: 'pi_success_12345',
    status: 'succeeded',
    amount: 15000,
    currency: 'usd',
  },
};

export const mockFailedPayment = {
  error: {
    type: 'card_error',
    code: 'card_declined',
    message: 'Your card was declined.',
  },
};

export const mockPaymentRequiresAction = {
  paymentIntent: {
    id: 'pi_action_12345',
    status: 'requires_action',
    next_action: {
      type: 'use_stripe_sdk',
    },
  },
};

// ==========================================
// SETUP HELPERS
// ==========================================

/**
 * Setup Stripe mocks before tests
 * Call this in your test file or setupTests
 */
export const setupStripeMocks = () => {
  // Mock @stripe/stripe-js
  jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
  }));

  // Mock @stripe/react-stripe-js
  jest.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useStripe: () => mockStripe,
    useElements: () => mockStripeElements,
    CardElement: (props: any) => (
      <div data-testid="mock-card-element" {...props} />
    ),
    CardNumberElement: (props: any) => (
      <div data-testid="mock-card-number-element" {...props} />
    ),
    CardExpiryElement: (props: any) => (
      <div data-testid="mock-card-expiry-element" {...props} />
    ),
    CardCvcElement: (props: any) => (
      <div data-testid="mock-card-cvc-element" {...props} />
    ),
    PaymentElement: (props: any) => (
      <div data-testid="mock-payment-element" {...props} />
    ),
    PaymentRequestButtonElement: (props: any) => (
      <div data-testid="mock-payment-request-button" {...props} />
    ),
  }));
};

/**
 * Reset all Stripe mocks
 * Call this in afterEach to reset mock state
 */
export const resetStripeMocks = () => {
  mockStripe.elements.mockClear();
  mockStripe.createToken.mockClear();
  mockStripe.createPaymentMethod.mockClear();
  mockStripe.confirmCardPayment.mockClear();
  mockStripe.confirmPayment.mockClear();
  mockStripe.confirmCardSetup.mockClear();
  mockStripe.retrievePaymentIntent.mockClear();
  mockStripeElements.create.mockClear();
  mockStripeElements.getElement.mockClear();
};

/**
 * Configure mock Stripe to return a specific payment result
 */
export const mockPaymentResult = (result: 'success' | 'failed' | 'requires_action') => {
  const responses: Record<string, unknown> = {
    success: mockSuccessfulPayment,
    failed: mockFailedPayment,
    requires_action: mockPaymentRequiresAction,
  };

  mockStripe.confirmCardPayment.mockResolvedValueOnce(responses[result]);
  mockStripe.confirmPayment.mockResolvedValueOnce(responses[result]);
};
