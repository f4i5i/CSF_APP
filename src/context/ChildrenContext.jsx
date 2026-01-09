/**
 * Children Context
 * Provides global state for children data and selected child
 * Persists selected child across page navigation
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { childrenService } from '../api/services';
import { useApi } from '../hooks/useApi';
import { useMutation } from '../hooks/useMutation';
import toast from 'react-hot-toast';

const ChildrenContext = createContext(null);

// Storage key for persisting selected child
const SELECTED_CHILD_KEY = 'csf_selected_child_id';

export const ChildrenProvider = ({ children: childrenProp }) => {
  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch children
  const {
    data: children,
    loading,
    error,
    refetch,
  } = useApi(childrenService.getMy, {
    autoFetch: true,
    initialData: [],
    onSuccess: (data) => {
      if (data && data.length > 0) {
        // Try to restore previously selected child from localStorage
        const savedChildId = localStorage.getItem(SELECTED_CHILD_KEY);
        if (savedChildId) {
          const savedChild = data.find(c => c.id === savedChildId);
          if (savedChild) {
            setSelectedChild(savedChild);
            return;
          }
        }
        // Auto-select first child if none selected or saved
        if (!selectedChild) {
          setSelectedChild(data[0]);
          localStorage.setItem(SELECTED_CHILD_KEY, data[0].id);
        }
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
      localStorage.setItem(SELECTED_CHILD_KEY, newChild.id);
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
      localStorage.removeItem(SELECTED_CHILD_KEY);
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
    }
  );

  // Select child and persist to localStorage
  const selectChild = useCallback((child) => {
    setSelectedChild(child);
    if (child?.id) {
      localStorage.setItem(SELECTED_CHILD_KEY, child.id);
    }
  }, []);

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

  const value = {
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

  return (
    <ChildrenContext.Provider value={value}>
      {childrenProp}
    </ChildrenContext.Provider>
  );
};

// Custom hook to use the children context
export const useChildren = () => {
  const context = useContext(ChildrenContext);
  if (!context) {
    throw new Error('useChildren must be used within a ChildrenProvider');
  }
  return context;
};

export default ChildrenContext;
