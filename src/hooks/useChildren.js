/**
 * useChildren Hook
 * Manages children data with CRUD operations and emergency contacts
 *
 * @example
 * const {
 *   children,
 *   loading,
 *   error,
 *   refetch,
 *   createChild,
 *   updateChild,
 *   deleteChild,
 *   selectedChild,
 *   selectChild
 * } = useChildren();
 */

import { useState, useCallback } from 'react';
import { childrenService } from '../api/services';
import { useApi } from './useApi';
import { useMutation } from './useMutation';
import toast from 'react-hot-toast';

export const useChildren = (options = {}) => {
  const { autoFetch = true } = options;

  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch children
  const {
    data: children,
    loading,
    error,
    refetch,
  } = useApi(childrenService.getMy, {
    autoFetch,
    initialData: [],
    onSuccess: (data) => {
      // Auto-select first child if none selected
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    },
  });

  // Create child mutation
  const {
    mutate: createChildMutation,
    loading: creating,
    error: createError,
  } = useMutation(childrenService.create, {
    onSuccess: (newChild) => {
      toast.success('Child added successfully!');
      refetch();
      setSelectedChild(newChild);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Update child mutation
  const {
    mutate: updateChildMutation,
    loading: updating,
    error: updateError,
  } = useMutation(
    ({ id, data }) => childrenService.update(id, data),
    {
      onSuccess: (updatedChild) => {
        toast.success('Child updated successfully!');
        refetch();
        if (selectedChild?.id === updatedChild.id) {
          setSelectedChild(updatedChild);
        }
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  // Delete child mutation
  const {
    mutate: deleteChildMutation,
    loading: deleting,
    error: deleteError,
  } = useMutation(childrenService.delete, {
    onSuccess: () => {
      toast.success('Child removed successfully!');
      refetch();
      setSelectedChild(null);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Emergency contacts mutations
  const {
    mutate: addEmergencyContactMutation,
    loading: addingContact,
  } = useMutation(
    ({ childId, contactData }) =>
      childrenService.addEmergencyContact(childId, contactData),
    {
      onSuccess: () => {
        toast.success('Emergency contact added!');
        refetch();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const {
    mutate: updateEmergencyContactMutation,
    loading: updatingContact,
  } = useMutation(
    ({ childId, contactId, contactData }) =>
      childrenService.updateEmergencyContact(childId, contactId, contactData),
    {
      onSuccess: () => {
        toast.success('Emergency contact updated!');
        refetch();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const {
    mutate: deleteEmergencyContactMutation,
    loading: deletingContact,
  } = useMutation(
    ({ childId, contactId }) => childrenService.deleteEmergencyContact(childId, contactId),
    {
    onSuccess: () => {
      toast.success('Emergency contact removed!');
      refetch();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Helper functions
  const createChild = useCallback(
    (childData) => {
      return createChildMutation(childData);
    },
    [createChildMutation]
  );

  const updateChild = useCallback(
    (id, childData) => {
      return updateChildMutation({ id, data: childData });
    },
    [updateChildMutation]
  );

  const deleteChild = useCallback(
    (id) => {
      return deleteChildMutation(id);
    },
    [deleteChildMutation]
  );

  const selectChild = useCallback((child) => {
    setSelectedChild(child);
  }, []);

  const addEmergencyContact = useCallback(
    (childId, contactData) => {
      return addEmergencyContactMutation({ childId, contactData });
    },
    [addEmergencyContactMutation]
  );

  const updateEmergencyContact = useCallback(
    (childId, contactId, contactData) => {
      return updateEmergencyContactMutation({ childId, contactId, contactData });
    },
    [updateEmergencyContactMutation]
  );

  const deleteEmergencyContact = useCallback(
    (childId, contactId) => {
      return deleteEmergencyContactMutation({ childId, contactId });
    },
    [deleteEmergencyContactMutation]
  );

  // Get child by ID from cached children
  const getChildById = useCallback(
    (id) => {
      return children?.find((child) => child.id === id);
    },
    [children]
  );

  return {
    // Data
    children: children || [],
    selectedChild,

    // Loading states
    loading,
    creating,
    updating,
    deleting,
    isLoading: loading || creating || updating || deleting,

    // Contact loading states
    addingContact,
    updatingContact,
    deletingContact,

    // Errors
    error,
    createError,
    updateError,
    deleteError,

    // Child operations
    createChild,
    updateChild,
    deleteChild,
    refetch,
    selectChild,
    getChildById,

    // Emergency contact operations
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,

    // Computed values
    hasChildren: children && children.length > 0,
    childrenCount: children?.length || 0,
  };
};

export default useChildren;
