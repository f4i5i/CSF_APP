/**
 * Custom Hooks Index
 * Central export for all custom hooks
 */

export { useApi } from './useApi';
export { useMutation } from './useMutation';
export { useChildren } from '../context/ChildrenContext'; // Use context-based hook for global state
export { useEnrollments } from './useEnrollments';
export { useToast } from './useToast';

// Re-export default exports
export { default as useApiHook } from './useApi';
export { default as useMutationHook } from './useMutation';
export { default as useEnrollmentsHook } from './useEnrollments';
export { default as useToastHook } from './useToast';
