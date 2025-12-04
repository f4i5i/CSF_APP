/**
 * useToast Hook
 * Wrapper around react-hot-toast with pre-configured settings
 *
 * @example
 * const toast = useToast();
 * toast.success('Operation successful!');
 * toast.error('Something went wrong');
 * toast.promise(apiCall(), {
 *   loading: 'Saving...',
 *   success: 'Saved!',
 *   error: 'Failed to save'
 * });
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useToast = () => {
  // Success toast
  const success = useCallback((message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options,
    });
  }, []);

  // Error toast
  const error = useCallback((message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    });
  }, []);

  // Info toast
  const info = useCallback((message, options = {}) => {
    return toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  }, []);

  // Warning toast
  const warning = useCallback((message, options = {}) => {
    return toast(message, {
      duration: 3500,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  }, []);

  // Loading toast
  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    });
  }, []);

  // Promise toast
  const promise = useCallback((promiseFunc, messages, options = {}) => {
    return toast.promise(
      promiseFunc,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: 'top-right',
        ...options,
      }
    );
  }, []);

  // Custom toast
  const custom = useCallback((message, options = {}) => {
    return toast(message, {
      position: 'top-right',
      ...options,
    });
  }, []);

  // Dismiss toast
  const dismiss = useCallback((toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    custom,
    dismiss,
    dismissAll,
  };
};

export default useToast;
