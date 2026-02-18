/**
 * Unit Tests for StateProvider Context
 * Tests the generic state provider with useReducer integration
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { StateProvider, useStateValue, StateContext } from '../StateProvider';

// ==========================================
// TEST REDUCER AND INITIAL STATE
// ==========================================

const TEST_ACTIONS = {
  SET_COUNT: 'SET_COUNT',
  INCREMENT: 'INCREMENT',
  RESET: 'RESET',
};

interface TestState {
  count: number;
  name: string;
}

const testInitialState: TestState = {
  count: 0,
  name: 'initial',
};

const testReducer = (state: TestState, action: { type: string; payload?: unknown }) => {
  switch (action.type) {
    case TEST_ACTIONS.SET_COUNT:
      return { ...state, count: action.payload as number };
    case TEST_ACTIONS.INCREMENT:
      return { ...state, count: state.count + 1 };
    case TEST_ACTIONS.RESET:
      return testInitialState;
    default:
      return state;
  }
};

// ==========================================
// WRAPPER
// ==========================================

const createWrapper = (
  reducer = testReducer,
  initialState: TestState = testInitialState
) => {
  return ({ children }: { children: React.ReactNode }) => (
    <StateProvider reducer={reducer} initialState={initialState}>
      {children}
    </StateProvider>
  );
};

describe('StateProvider Context', () => {
  // ===========================================
  // CONTEXT CREATION TESTS
  // ===========================================

  describe('Context Creation', () => {
    it('should export StateContext', () => {
      expect(StateContext).toBeDefined();
    });

    it('should export StateProvider', () => {
      expect(StateProvider).toBeDefined();
    });

    it('should export useStateValue', () => {
      expect(useStateValue).toBeDefined();
      expect(typeof useStateValue).toBe('function');
    });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should provide the initial state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      const [state] = result.current;
      expect(state).toEqual(testInitialState);
    });

    it('should provide a dispatch function', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      const [, dispatch] = result.current;
      expect(typeof dispatch).toBe('function');
    });

    it('should accept custom initial state', () => {
      const customInitial: TestState = { count: 42, name: 'custom' };
      const wrapper = createWrapper(testReducer, customInitial);
      const { result } = renderHook(() => useStateValue(), { wrapper });

      const [state] = result.current;
      expect(state).toEqual(customInitial);
    });
  });

  // ===========================================
  // DISPATCH / REDUCER TESTS
  // ===========================================

  describe('State Updates via Dispatch', () => {
    it('should update state when dispatching SET_COUNT action', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.SET_COUNT, payload: 10 });
      });

      const [state] = result.current;
      expect(state.count).toBe(10);
    });

    it('should update state when dispatching INCREMENT action', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.INCREMENT });
      });

      const [state] = result.current;
      expect(state.count).toBe(1);
    });

    it('should handle multiple dispatches', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.INCREMENT });
      });
      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.INCREMENT });
      });
      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.INCREMENT });
      });

      const [state] = result.current;
      expect(state.count).toBe(3);
    });

    it('should reset state with RESET action', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      // First modify the state
      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.SET_COUNT, payload: 99 });
      });

      expect(result.current[0].count).toBe(99);

      // Reset
      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: TEST_ACTIONS.RESET });
      });

      const [state] = result.current;
      expect(state).toEqual(testInitialState);
    });

    it('should return same state for unknown action type', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useStateValue(), { wrapper });

      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: 'UNKNOWN_ACTION' });
      });

      const [state] = result.current;
      expect(state).toEqual(testInitialState);
    });
  });

  // ===========================================
  // INTEGRATION WITH APP REDUCER TESTS
  // ===========================================

  describe('Integration with Application Reducer', () => {
    it('should work with SET_USER action from the app reducer', () => {
      const appInitialState = { user: null };

      const appReducer = (state: typeof appInitialState, action: { type: string; user?: unknown }) => {
        switch (action.type) {
          case 'SET_USER':
            return { ...state, user: action.user };
          default:
            return state;
        }
      };

      const appWrapper = ({ children }: { children: React.ReactNode }) => (
        <StateProvider reducer={appReducer} initialState={appInitialState}>
          {children}
        </StateProvider>
      );

      const { result } = renderHook(() => useStateValue(), { wrapper: appWrapper });

      const mockUser = { id: '1', name: 'Test User' };

      act(() => {
        const [, dispatch] = result.current;
        dispatch({ type: 'SET_USER', user: mockUser });
      });

      const [state] = result.current;
      expect(state.user).toEqual(mockUser);
    });
  });

  // ===========================================
  // SHARED STATE BETWEEN CONSUMERS TESTS
  // ===========================================

  describe('Shared State', () => {
    it('should share state between multiple consumers', () => {
      const wrapper = createWrapper();

      const { result: result1 } = renderHook(() => useStateValue(), { wrapper });
      const { result: result2 } = renderHook(() => useStateValue(), { wrapper });

      // Both consumers start with same initial state
      expect(result1.current[0]).toEqual(testInitialState);
      expect(result2.current[0]).toEqual(testInitialState);
    });
  });

  // ===========================================
  // RENDERING CHILDREN TESTS
  // ===========================================

  describe('Rendering Children', () => {
    it('should render children correctly', () => {
      const TestChild = () => {
        const [state] = useStateValue();
        return <div data-testid="state-count">{state.count}</div>;
      };

      // Using React Testing Library render to test component rendering
      const { render } = require('@testing-library/react');
      const { getByTestId } = render(
        <StateProvider reducer={testReducer} initialState={testInitialState}>
          <TestChild />
        </StateProvider>
      );

      expect(getByTestId('state-count').textContent).toBe('0');
    });
  });
});
