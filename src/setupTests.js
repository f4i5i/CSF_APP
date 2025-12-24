/**
 * Jest Test Setup
 * This file runs before each test file
 * Note: Polyfills are in jest.polyfills.js which runs before this file
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// MSW (Mock Service Worker) setup for API mocking
import { server } from './mocks/server';

// ==========================================
// MSW SERVER LIFECYCLE
// ==========================================

// Start MSW server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
  // Clear localStorage between tests
  localStorage.clear();
  // Clear sessionStorage between tests
  sessionStorage.clear();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});

// ==========================================
// GLOBAL MOCKS
// ==========================================

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for lazy loading components
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver for responsive components
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock scrollTo for navigation tests
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock crypto.randomUUID for nanoid and other UUID generators
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    ...window.crypto,
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// ==========================================
// CONSOLE FILTERING
// ==========================================

// Suppress specific console warnings/errors during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Filter out React 18 specific warnings that don't affect tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Filter out specific warnings
    if (
      typeof args[0] === 'string' &&
      args[0].includes('React Router Future Flag Warning')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
