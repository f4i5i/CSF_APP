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
        background: '#32AE60', // status-success (tailwind)
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#32AE60',
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
        background: '#D02F2F', // error-main (tailwind)
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#D02F2F',
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
        background: '#7E97B5', // btn-secondary (tailwind)
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#7E97B5',
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
        background: '#EBD13E', // warning-main (tailwind)
        color: '#173151', // text-primary for contrast on yellow
      },
      iconTheme: {
        primary: '#173151',
        secondary: '#EBD13E',
      },
      ...options,
    });
  }, []);

  // Loading toast
  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#F3BC48', // btn-gold (tailwind)
        color: '#173151',
      },
      iconTheme: {
        primary: '#173151',
        secondary: '#F3BC48',
      },
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
