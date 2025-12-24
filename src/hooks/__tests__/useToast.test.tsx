/**
 * Unit Tests for useToast Hook
 * Tests toast notifications for success, error, info, warning, loading, and promise
 */

import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

// Mock react-hot-toast
const mockToast = Object.assign(jest.fn(() => 'custom-toast-id'), {
  success: jest.fn(() => 'success-toast-id'),
  error: jest.fn(() => 'error-toast-id'),
  loading: jest.fn(() => 'loading-toast-id'),
  promise: jest.fn(() => Promise.resolve()),
  dismiss: jest.fn(),
});

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: mockToast,
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RETURN VALUES TESTS
  // ===========================================
  describe('Return Values', () => {
    it('should return all toast functions', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('info');
      expect(result.current).toHaveProperty('warning');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('promise');
      expect(result.current).toHaveProperty('custom');
      expect(result.current).toHaveProperty('dismiss');
      expect(result.current).toHaveProperty('dismissAll');
    });

    it('should return functions', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.info).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.loading).toBe('function');
      expect(typeof result.current.promise).toBe('function');
      expect(typeof result.current.custom).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
      expect(typeof result.current.dismissAll).toBe('function');
    });
  });

  // ===========================================
  // SUCCESS TOAST TESTS
  // ===========================================
  describe('Success Toast', () => {
    it('should call toast.success with message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message');
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Success message',
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
        })
      );
    });

    it('should include custom options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success', { duration: 5000 });
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('should return toast ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.success('Success');
      });

      expect(toastId).toBe('success-toast-id');
    });

    it('should have green background styling', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success');
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#32AE60',
            color: '#ffffff',
          }),
        })
      );
    });
  });

  // ===========================================
  // ERROR TOAST TESTS
  // ===========================================
  describe('Error Toast', () => {
    it('should call toast.error with message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message');
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          duration: 4000,
          position: 'top-right',
        })
      );
    });

    it('should have longer duration than success', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error');
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          duration: 4000, // Longer than success (3000)
        })
      );
    });

    it('should have red background styling', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error');
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#D02F2F',
            color: '#ffffff',
          }),
        })
      );
    });
  });

  // ===========================================
  // INFO TOAST TESTS
  // ===========================================
  describe('Info Toast', () => {
    it('should call toast with info icon', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message');
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({
          icon: expect.any(String),
          duration: 3000,
        })
      );
    });
  });

  // ===========================================
  // WARNING TOAST TESTS
  // ===========================================
  describe('Warning Toast', () => {
    it('should call toast with warning icon', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          icon: expect.any(String),
          duration: 3500,
        })
      );
    });

    it('should have yellow background styling', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning');
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Warning',
        expect.objectContaining({
          style: expect.objectContaining({
            background: '#EBD13E',
          }),
        })
      );
    });
  });

  // ===========================================
  // LOADING TOAST TESTS
  // ===========================================
  describe('Loading Toast', () => {
    it('should call toast.loading with message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.loading('Loading...');
      });

      expect(mockToast.loading).toHaveBeenCalledWith(
        'Loading...',
        expect.objectContaining({
          position: 'top-right',
        })
      );
    });

    it('should return loading toast ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.loading('Loading');
      });

      expect(toastId).toBe('loading-toast-id');
    });
  });

  // ===========================================
  // PROMISE TOAST TESTS
  // ===========================================
  describe('Promise Toast', () => {
    it('should call toast.promise with all messages', () => {
      const { result } = renderHook(() => useToast());
      const mockPromise = Promise.resolve({ data: 'test' });

      act(() => {
        result.current.promise(mockPromise, {
          loading: 'Loading...',
          success: 'Done!',
          error: 'Failed!',
        });
      });

      expect(mockToast.promise).toHaveBeenCalledWith(
        mockPromise,
        {
          loading: 'Loading...',
          success: 'Done!',
          error: 'Failed!',
        },
        expect.objectContaining({
          position: 'top-right',
        })
      );
    });

    it('should use default messages when not provided', () => {
      const { result } = renderHook(() => useToast());
      const mockPromise = Promise.resolve();

      act(() => {
        result.current.promise(mockPromise, {});
      });

      expect(mockToast.promise).toHaveBeenCalledWith(
        mockPromise,
        {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error occurred',
        },
        expect.any(Object)
      );
    });
  });

  // ===========================================
  // CUSTOM TOAST TESTS
  // ===========================================
  describe('Custom Toast', () => {
    it('should call toast with message and options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.custom('Custom message', { icon: '🎉' });
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Custom message',
        expect.objectContaining({
          position: 'top-right',
          icon: '🎉',
        })
      );
    });
  });

  // ===========================================
  // DISMISS TESTS
  // ===========================================
  describe('Dismiss', () => {
    it('should call toast.dismiss with toast ID', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss('some-toast-id');
      });

      expect(mockToast.dismiss).toHaveBeenCalledWith('some-toast-id');
    });

    it('should call toast.dismiss without ID to dismiss all', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss();
      });

      expect(mockToast.dismiss).toHaveBeenCalledWith();
    });

    it('should dismiss all toasts with dismissAll', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismissAll();
      });

      expect(mockToast.dismiss).toHaveBeenCalled();
    });
  });

  // ===========================================
  // STABILITY TESTS
  // ===========================================
  describe('Function Stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useToast());

      const firstSuccess = result.current.success;
      const firstError = result.current.error;

      rerender();

      expect(result.current.success).toBe(firstSuccess);
      expect(result.current.error).toBe(firstError);
    });
  });
});
