/**
 * Unit Tests for StepperContext
 * Tests the UseContextProvider and useStepperContext hook
 * for managing stepper form state (userData)
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { UseContextProvider, useStepperContext } from '../StepperContext';

// ==========================================
// WRAPPER
// ==========================================

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UseContextProvider>{children}</UseContextProvider>
);

describe('StepperContext', () => {
  // ===========================================
  // CONTEXT CREATION TESTS
  // ===========================================

  describe('Exports', () => {
    it('should export UseContextProvider', () => {
      expect(UseContextProvider).toBeDefined();
    });

    it('should export useStepperContext', () => {
      expect(useStepperContext).toBeDefined();
      expect(typeof useStepperContext).toBe('function');
    });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should provide initial userData as empty string', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      expect(result.current.userData).toBe('');
    });

    it('should provide setUserData function', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      expect(result.current.setUserData).toBeDefined();
      expect(typeof result.current.setUserData).toBe('function');
    });
  });

  // ===========================================
  // STATE UPDATE TESTS
  // ===========================================

  describe('State Updates', () => {
    it('should update userData with setUserData', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      act(() => {
        result.current.setUserData('step 1 data');
      });

      expect(result.current.userData).toBe('step 1 data');
    });

    it('should accept object as userData', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      const formData = {
        name: 'John',
        email: 'john@test.com',
        step: 2,
      };

      act(() => {
        result.current.setUserData(formData);
      });

      expect(result.current.userData).toEqual(formData);
    });

    it('should accept array as userData', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      act(() => {
        result.current.setUserData(['step1', 'step2']);
      });

      expect(result.current.userData).toEqual(['step1', 'step2']);
    });

    it('should allow setting userData to null', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      act(() => {
        result.current.setUserData('some data');
      });
      expect(result.current.userData).toBe('some data');

      act(() => {
        result.current.setUserData(null);
      });

      expect(result.current.userData).toBeNull();
    });

    it('should support multiple sequential updates', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      act(() => {
        result.current.setUserData('first');
      });
      expect(result.current.userData).toBe('first');

      act(() => {
        result.current.setUserData('second');
      });
      expect(result.current.userData).toBe('second');

      act(() => {
        result.current.setUserData('third');
      });
      expect(result.current.userData).toBe('third');
    });

    it('should support functional updates via React setState convention', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      act(() => {
        result.current.setUserData({ count: 1 });
      });

      act(() => {
        result.current.setUserData((prev: { count: number }) => ({
          ...prev,
          count: prev.count + 1,
        }));
      });

      expect(result.current.userData).toEqual({ count: 2 });
    });
  });

  // ===========================================
  // CONSUMER COMPONENT TESTS
  // ===========================================

  describe('Consumer Component Integration', () => {
    it('should provide context values to child components', () => {
      const TestConsumer = () => {
        const { userData } = useStepperContext();
        return <div data-testid="user-data">{String(userData)}</div>;
      };

      render(
        <UseContextProvider>
          <TestConsumer />
        </UseContextProvider>
      );

      expect(screen.getByTestId('user-data').textContent).toBe('');
    });

    it('should re-render consumer when context value changes', () => {
      const renderCount = { current: 0 };

      const TestConsumer = () => {
        const { userData, setUserData } = useStepperContext();
        renderCount.current += 1;
        return (
          <div>
            <span data-testid="user-data">{String(userData)}</span>
            <button onClick={() => setUserData('updated')} data-testid="update-btn">
              Update
            </button>
          </div>
        );
      };

      render(
        <UseContextProvider>
          <TestConsumer />
        </UseContextProvider>
      );

      expect(screen.getByTestId('user-data').textContent).toBe('');

      // Click the update button
      act(() => {
        screen.getByTestId('update-btn').click();
      });

      expect(screen.getByTestId('user-data').textContent).toBe('updated');
    });
  });

  // ===========================================
  // DEFAULT CONTEXT VALUE TESTS
  // ===========================================

  describe('Default Context Value (outside provider)', () => {
    it('should have default context with empty userData', () => {
      // When used outside provider, default context has userData: "" and setUserData: null
      // This tests the default fallback (no error thrown, just defaults)
      const { result } = renderHook(() => useStepperContext());

      // Default context: userData is "" and setUserData is null
      expect(result.current.userData).toBe('');
      expect(result.current.setUserData).toBeNull();
    });
  });

  // ===========================================
  // RETURN VALUE SHAPE TESTS
  // ===========================================

  describe('Return Value Shape', () => {
    it('should return exactly userData and setUserData', () => {
      const { result } = renderHook(() => useStepperContext(), { wrapper });

      const keys = Object.keys(result.current);
      expect(keys).toContain('userData');
      expect(keys).toContain('setUserData');
      expect(keys).toHaveLength(2);
    });
  });
});
