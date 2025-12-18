/**
 * @file usePaymentMethods Hooks
 * @description React Query hooks for managing user payment methods with Stripe integration.
 *
 * This file provides comprehensive payment method management including:
 * - usePaymentMethods: Fetch user's saved payment methods
 * - useCreateSetupIntent: Initialize Stripe setup for adding payment methods
 * - useAttachPaymentMethod: Save payment method to user account
 * - useSetDefaultPaymentMethod: Set a payment method as default
 * - useDeletePaymentMethod: Remove saved payment methods
 *
 * **Stripe Payment Method Flow:**
 * 1. useCreateSetupIntent - Create Stripe SetupIntent
 * 2. User enters card details in Stripe Elements
 * 3. Stripe validates and creates PaymentMethod
 * 4. useAttachPaymentMethod - Save PaymentMethod to user account
 * 5. useSetDefaultPaymentMethod - Optionally set as default (optional)
 *
 * **Security:**
 * - Payment methods are stored securely in Stripe
 * - Only Stripe IDs and metadata stored in our database
 * - PCI compliance handled by Stripe
 * - Card details never touch our servers
 *
 * @module hooks/payments/usePaymentMethods
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type {
  PaymentMethod,
  SetupIntentRequest,
  SetupIntentResponse,
  AttachPaymentMethodRequest,
} from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch user's saved payment methods
 *
 * @description
 * Retrieves all payment methods (cards, bank accounts) that the user has
 * saved in their account. These payment methods are stored securely in Stripe
 * and can be used for quick checkout.
 *
 * **Payment Method Data Includes:**
 * - Card brand (Visa, Mastercard, Amex, etc.)
 * - Last 4 digits of card
 * - Expiration date
 * - Cardholder name
 * - Default status
 * - Stripe PaymentMethod ID
 *
 * **Use Cases:**
 * - Display saved cards at checkout
 * - Payment method management page
 * - Quick payment selection
 * - Default payment method indicator
 *
 * **Caching Strategy:**
 * - Stale time: 5 minutes (payment methods don't change often)
 * - Cache time: 10 minutes
 * - Ideal for displaying in multiple places without refetching
 *
 * **Cache Invalidation:**
 * This query is invalidated by:
 * - useAttachPaymentMethod (when new method added)
 * - useSetDefaultPaymentMethod (when default changes)
 * - useDeletePaymentMethod (when method removed)
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<PaymentMethod[], ApiErrorResponse>} React Query result containing:
 * - data: Array of saved payment methods
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch payment methods
 *
 * @example
 * // Basic usage - display saved payment methods
 * ```tsx
 * const { data: paymentMethods, isLoading } = usePaymentMethods();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <h3>Saved Payment Methods</h3>
 *     {paymentMethods?.map(method => (
 *       <PaymentMethodCard
 *         key={method.id}
 *         brand={method.card_brand}
 *         last4={method.card_last4}
 *         isDefault={method.is_default}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Payment method selector at checkout
 * ```tsx
 * const { data: paymentMethods } = usePaymentMethods();
 * const [selected, setSelected] = useState<string>();
 *
 * useEffect(() => {
 *   // Auto-select default payment method
 *   const defaultMethod = paymentMethods?.find(pm => pm.is_default);
 *   if (defaultMethod) setSelected(defaultMethod.id);
 * }, [paymentMethods]);
 *
 * return (
 *   <PaymentMethodSelector
 *     methods={paymentMethods}
 *     selected={selected}
 *     onChange={setSelected}
 *   />
 * );
 * ```
 *
 * @example
 * // Empty state with add new card prompt
 * ```tsx
 * const { data: paymentMethods, isLoading } = usePaymentMethods();
 *
 * if (isLoading) return <Spinner />;
 *
 * if (!paymentMethods || paymentMethods.length === 0) {
 *   return (
 *     <EmptyState
 *       icon={CreditCardIcon}
 *       title="No payment methods"
 *       description="Add a payment method to get started"
 *       action={
 *         <Button onClick={() => navigate('/settings/payment-methods/add')}>
 *           Add Payment Method
 *         </Button>
 *       }
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link useAttachPaymentMethod} for adding new payment methods
 * @see {@link useSetDefaultPaymentMethod} for setting default
 * @see {@link useDeletePaymentMethod} for removing payment methods
 */
export function usePaymentMethods(
  queryOptions?: Omit<UseQueryOptions<PaymentMethod[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.paymentMethods.lists(),
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * Hook to create Stripe SetupIntent for adding a new payment method
 *
 * @description
 * Creates a Stripe SetupIntent which is required to collect and save payment
 * method details securely. This is the first step in adding a new payment method.
 *
 * **Stripe SetupIntent Flow:**
 * 1. **useCreateSetupIntent** - Create SetupIntent on backend
 * 2. Use client_secret with Stripe Elements to collect card
 * 3. Stripe validates and creates PaymentMethod
 * 4. useAttachPaymentMethod - Save to user account
 *
 * **What is a SetupIntent?**
 * A SetupIntent is a Stripe object that represents your intention to set up
 * a customer's payment method for future payments. Unlike PaymentIntent
 * (for immediate charges), SetupIntent is specifically for saving cards.
 *
 * **Request Parameters:**
 * - return_url: URL to redirect after setup (optional)
 * - customer_id: Stripe customer ID (usually handled by backend)
 *
 * **Response Contains:**
 * - client_secret: Secret key for Stripe Elements
 * - setup_intent_id: Stripe SetupIntent identifier
 * - status: Setup status ('requires_payment_method', 'succeeded', etc.)
 *
 * **Use Cases:**
 * - Adding first payment method
 * - Adding additional cards
 * - Updating expired cards
 * - Stripe Elements integration
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to create setup intent
 * - data: SetupIntentResponse with client_secret
 * - isPending: Loading state indicator
 * - error: Error details if creation failed
 *
 * @example
 * // Basic usage with Stripe Elements
 * ```tsx
 * const { mutate: createSetupIntent, data: setupIntent } = useCreateSetupIntent();
 * const stripe = useStripe();
 * const elements = useElements();
 *
 * const handleAddCard = async () => {
 *   // Step 1: Create SetupIntent
 *   createSetupIntent(
 *     { return_url: window.location.href },
 *     {
 *       onSuccess: async (response) => {
 *         // Step 2: Confirm with Stripe
 *         const { error, setupIntent } = await stripe.confirmCardSetup(
 *           response.client_secret,
 *           {
 *             payment_method: {
 *               card: elements.getElement(CardElement),
 *             }
 *           }
 *         );
 *
 *         if (error) {
 *           toast.error(error.message);
 *         } else {
 *           // Step 3: Attach to account
 *           attachPaymentMethod({
 *             payment_method_id: setupIntent.payment_method
 *           });
 *         }
 *       }
 *     }
 *   );
 * };
 * ```
 *
 * @example
 * // Complete add payment method flow
 * ```tsx
 * const AddPaymentMethodForm = () => {
 *   const { mutate: createSetupIntent, isPending } = useCreateSetupIntent();
 *   const { mutate: attachPaymentMethod } = useAttachPaymentMethod();
 *   const stripe = useStripe();
 *   const elements = useElements();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     if (!stripe || !elements) return;
 *
 *     createSetupIntent(undefined, {
 *       onSuccess: async ({ client_secret }) => {
 *         const { error, setupIntent } = await stripe.confirmCardSetup(
 *           client_secret,
 *           {
 *             payment_method: {
 *               card: elements.getElement(CardElement),
 *               billing_details: { name: cardholderName }
 *             }
 *           }
 *         );
 *
 *         if (setupIntent?.payment_method) {
 *           attachPaymentMethod({
 *             payment_method_id: setupIntent.payment_method
 *           });
 *         }
 *       }
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <CardElement />
 *       <Button type="submit" disabled={isPending}>
 *         Add Card
 *       </Button>
 *     </form>
 *   );
 * };
 * ```
 *
 * @see {@link useAttachPaymentMethod} for saving the payment method after setup
 * @see {@link usePaymentMethods} for viewing saved payment methods
 */
export function useCreateSetupIntent(
  options?: Omit<
    UseMutationOptions<SetupIntentResponse, ApiErrorResponse, SetupIntentRequest | undefined>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: (request?: SetupIntentRequest) => paymentService.createSetupIntent(request),

    onError: (error) => {
      toast.error(error.message || 'Failed to initialize payment method setup');
    },

    ...options,
  });
}

/**
 * Hook to attach a Stripe payment method to the user's account
 *
 * @description
 * Saves a Stripe PaymentMethod to the user's account for future use. This is
 * called after successfully creating a SetupIntent and collecting payment details.
 * The payment method becomes available for checkout and can be set as default.
 *
 * **When to Use:**
 * - After Stripe SetupIntent succeeds
 * - After collecting card details with Stripe Elements
 * - When PaymentMethod ID is received from Stripe
 * - Before allowing user to make payment with saved card
 *
 * **What This Hook Does:**
 * - Associates Stripe PaymentMethod with user account
 * - Stores payment method metadata in database
 * - Invalidates payment methods cache
 * - Shows success/error toast notifications
 * - Implements optimistic updates with rollback
 *
 * **Request Format:**
 * ```typescript
 * {
 *   payment_method_id: string // Stripe PaymentMethod ID (pm_xxx)
 * }
 * ```
 *
 * **Cache Behavior:**
 * - Optimistically cancels in-flight queries
 * - Snapshots current state for rollback
 * - Invalidates payment methods list on success
 * - Rolls back on error
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to attach payment method
 * - data: Saved PaymentMethod object
 * - isPending: Loading state indicator
 * - error: Error details if attachment failed
 *
 * @example
 * // Basic usage after Stripe setup
 * ```tsx
 * const { mutate: attachPaymentMethod, isPending } = useAttachPaymentMethod();
 * const stripe = useStripe();
 *
 * const saveCard = async (setupIntentId: string) => {
 *   const setupIntent = await stripe.retrieveSetupIntent(setupIntentId);
 *
 *   if (setupIntent.status === 'succeeded') {
 *     attachPaymentMethod({
 *       payment_method_id: setupIntent.payment_method as string
 *     });
 *   }
 * };
 * ```
 *
 * @example
 * // Complete flow with Stripe Elements
 * ```tsx
 * const { mutate: createSetupIntent } = useCreateSetupIntent();
 * const { mutate: attachPaymentMethod } = useAttachPaymentMethod({
 *   onSuccess: (paymentMethod) => {
 *     toast.success('Card saved successfully!');
 *     navigate('/settings/payment-methods');
 *   }
 * });
 *
 * const handleSaveCard = async () => {
 *   createSetupIntent(undefined, {
 *     onSuccess: async ({ client_secret }) => {
 *       const { error, setupIntent } = await stripe.confirmCardSetup(
 *         client_secret,
 *         {
 *           payment_method: {
 *             card: elements.getElement(CardElement)
 *           }
 *         }
 *       );
 *
 *       if (error) {
 *         toast.error(error.message);
 *       } else if (setupIntent.payment_method) {
 *         // Save to user account
 *         attachPaymentMethod({
 *           payment_method_id: setupIntent.payment_method as string
 *         });
 *       }
 *     }
 *   });
 * };
 * ```
 *
 * @example
 * // With automatic default setting for first card
 * ```tsx
 * const { data: existingMethods } = usePaymentMethods();
 * const { mutate: attachPaymentMethod } = useAttachPaymentMethod();
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 *
 * const saveCard = (paymentMethodId: string) => {
 *   attachPaymentMethod(
 *     { payment_method_id: paymentMethodId },
 *     {
 *       onSuccess: (savedMethod) => {
 *         // Set as default if it's the first card
 *         if (!existingMethods || existingMethods.length === 0) {
 *           setDefault({ payment_method_id: savedMethod.id });
 *         }
 *       }
 *     }
 *   );
 * };
 * ```
 *
 * @see {@link useCreateSetupIntent} for creating SetupIntent before attaching
 * @see {@link useSetDefaultPaymentMethod} for setting as default after attaching
 * @see {@link usePaymentMethods} for viewing all saved methods
 */
export function useAttachPaymentMethod(
  options?: Omit<
    UseMutationOptions<
      PaymentMethod,
      ApiErrorResponse,
      AttachPaymentMethodRequest,
      { previousMethods: PaymentMethod[] | undefined }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AttachPaymentMethodRequest) =>
      paymentService.attachPaymentMethod(request),

    onMutate: async (): Promise<{ previousMethods: PaymentMethod[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentMethods.lists() });

      // Snapshot
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(queryKeys.paymentMethods.lists());
      return { previousMethods };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMethods) {
        queryClient.setQueryData(queryKeys.paymentMethods.lists(), context.previousMethods);
      }
      toast.error(error.message || 'Failed to add payment method');
    },

    onSuccess: () => {
      // Invalidate payment methods query
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
      toast.success('Payment method added successfully!');
    },

    ...options,
  });
}

/**
 * Hook to set a payment method as the default for future transactions
 *
 * @description
 * Updates the user's default payment method. The default payment method is
 * automatically selected during checkout and used for subscription renewals.
 * Only one payment method can be default at a time.
 *
 * **What This Hook Does:**
 * - Sets specified payment method as default
 * - Unsets previous default (if any)
 * - Updates payment method metadata
 * - Invalidates payment methods cache
 * - Shows success/error notifications
 *
 * **Use Cases:**
 * - User selects preferred card
 * - Automatically set first card as default
 * - Update default after adding new card
 * - Payment method management page
 *
 * **Request Format:**
 * ```typescript
 * {
 *   payment_method_id: string // ID of method to set as default
 * }
 * ```
 *
 * **Cache Invalidation:**
 * - Invalidates payment methods list
 * - Ensures UI updates with new default indicator
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to set default payment method
 * - data: Updated PaymentMethod object
 * - isPending: Loading state indicator
 * - error: Error details if update failed
 *
 * @example
 * // Basic usage - set payment method as default
 * ```tsx
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 *
 * const handleSetDefault = (paymentMethodId: string) => {
 *   setDefault({ payment_method_id: paymentMethodId });
 * };
 *
 * return (
 *   <Button onClick={() => handleSetDefault('pm_123')}>
 *     Set as Default
 *   </Button>
 * );
 * ```
 *
 * @example
 * // Payment method list with default toggle
 * ```tsx
 * const { data: paymentMethods } = usePaymentMethods();
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 *
 * return (
 *   <div>
 *     {paymentMethods?.map(method => (
 *       <PaymentMethodCard key={method.id}>
 *         <CardInfo {...method} />
 *         {method.is_default ? (
 *           <Badge>Default</Badge>
 *         ) : (
 *           <Button
 *             onClick={() => setDefault({ payment_method_id: method.id })}
 *           >
 *             Set as Default
 *           </Button>
 *         )}
 *       </PaymentMethodCard>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Auto-set first card as default
 * ```tsx
 * const { data: paymentMethods } = usePaymentMethods();
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 * const { mutate: attachPaymentMethod } = useAttachPaymentMethod({
 *   onSuccess: (newMethod) => {
 *     // If no default exists, set this one
 *     const hasDefault = paymentMethods?.some(pm => pm.is_default);
 *     if (!hasDefault) {
 *       setDefault({ payment_method_id: newMethod.id });
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * // With confirmation dialog
 * ```tsx
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 * const [confirmOpen, setConfirmOpen] = useState(false);
 * const [selectedId, setSelectedId] = useState<string>();
 *
 * const handleSetDefault = (id: string) => {
 *   setSelectedId(id);
 *   setConfirmOpen(true);
 * };
 *
 * const confirmSetDefault = () => {
 *   if (selectedId) {
 *     setDefault({ payment_method_id: selectedId });
 *     setConfirmOpen(false);
 *   }
 * };
 * ```
 *
 * @see {@link usePaymentMethods} for viewing all payment methods
 * @see {@link useAttachPaymentMethod} for adding new payment methods
 */
export function useSetDefaultPaymentMethod(
  options?: Omit<
    UseMutationOptions<PaymentMethod, ApiErrorResponse, { payment_method_id: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payment_method_id }: { payment_method_id: string }) =>
      paymentService.setDefaultPaymentMethod(payment_method_id),

    onSuccess: () => {
      // Invalidate payment methods query
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
      toast.success('Default payment method updated!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to set default payment method');
    },

    ...options,
  });
}

/**
 * Hook to remove a saved payment method from the user's account
 *
 * @description
 * Deletes a payment method from both the user's account and Stripe. This action
 * is permanent and cannot be undone. The payment method can be re-added later if needed.
 *
 * **What This Hook Does:**
 * - Removes payment method from user account
 * - Detaches payment method from Stripe customer
 * - Optimistically updates UI (removed immediately)
 * - Rolls back on error
 * - Shows success/error notifications
 *
 * **Important Notes:**
 * - Cannot delete the default payment method if subscriptions exist
 * - Deleted methods cannot be recovered
 * - In-progress payments using this method may fail
 * - Consider confirmation dialog before deletion
 *
 * **Use Cases:**
 * - User removes old/expired cards
 * - Cleaning up unused payment methods
 * - Removing duplicate cards
 * - Payment method management
 *
 * **Optimistic Updates:**
 * - Payment method removed from UI immediately
 * - Rolled back if server request fails
 * - Provides smooth user experience
 *
 * **Cache Behavior:**
 * - Optimistically removes from cache
 * - Snapshots state for rollback
 * - No invalidation needed (optimistic update)
 * - Rollback restores previous state on error
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to delete payment method (takes payment method ID as string)
 * - isPending: Loading state indicator
 * - error: Error details if deletion failed
 *
 * @example
 * // Basic usage with confirmation
 * ```tsx
 * const { mutate: deleteMethod } = useDeletePaymentMethod();
 *
 * const handleDelete = (paymentMethodId: string) => {
 *   if (confirm('Are you sure you want to remove this payment method?')) {
 *     deleteMethod(paymentMethodId);
 *   }
 * };
 *
 * return (
 *   <Button onClick={() => handleDelete('pm_123')} variant="danger">
 *     Remove Card
 *   </Button>
 * );
 * ```
 *
 * @example
 * // With confirmation dialog component
 * ```tsx
 * const { mutate: deleteMethod, isPending } = useDeletePaymentMethod({
 *   onSuccess: () => {
 *     toast.success('Payment method removed');
 *     setConfirmOpen(false);
 *   }
 * });
 *
 * const [confirmOpen, setConfirmOpen] = useState(false);
 * const [methodToDelete, setMethodToDelete] = useState<string>();
 *
 * return (
 *   <>
 *     <Button onClick={() => {
 *       setMethodToDelete(paymentMethodId);
 *       setConfirmOpen(true);
 *     }}>
 *       Remove
 *     </Button>
 *
 *     <ConfirmDialog
 *       open={confirmOpen}
 *       title="Remove Payment Method"
 *       message="Are you sure? This action cannot be undone."
 *       onConfirm={() => methodToDelete && deleteMethod(methodToDelete)}
 *       onCancel={() => setConfirmOpen(false)}
 *       isLoading={isPending}
 *     />
 *   </>
 * );
 * ```
 *
 * @example
 * // Payment method management with delete
 * ```tsx
 * const { data: paymentMethods } = usePaymentMethods();
 * const { mutate: deleteMethod } = useDeletePaymentMethod();
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 *
 * const handleDelete = (method: PaymentMethod) => {
 *   // Prevent deleting last payment method if user has active subscriptions
 *   if (hasActiveSubscriptions && paymentMethods?.length === 1) {
 *     toast.error('Cannot delete last payment method while subscription is active');
 *     return;
 *   }
 *
 *   // If deleting default, set another as default first
 *   if (method.is_default && paymentMethods && paymentMethods.length > 1) {
 *     const nextMethod = paymentMethods.find(pm => pm.id !== method.id);
 *     if (nextMethod) {
 *       setDefault(
 *         { payment_method_id: nextMethod.id },
 *         {
 *           onSuccess: () => {
 *             deleteMethod(method.id);
 *           }
 *         }
 *       );
 *       return;
 *     }
 *   }
 *
 *   deleteMethod(method.id);
 * };
 * ```
 *
 * @example
 * // With undo functionality
 * ```tsx
 * const { mutate: deleteMethod } = useDeletePaymentMethod();
 * const [deletedMethod, setDeletedMethod] = useState<PaymentMethod | null>(null);
 *
 * const handleDelete = (method: PaymentMethod) => {
 *   setDeletedMethod(method);
 *   deleteMethod(method.id, {
 *     onSuccess: () => {
 *       toast.success(
 *         <div>
 *           Payment method removed
 *           <Button onClick={handleUndo}>Undo</Button>
 *         </div>,
 *         { duration: 5000 }
 *       );
 *     }
 *   });
 * };
 *
 * const handleUndo = () => {
 *   if (deletedMethod) {
 *     // Re-add the payment method
 *     attachPaymentMethod({
 *       payment_method_id: deletedMethod.stripe_payment_method_id
 *     });
 *   }
 * };
 * ```
 *
 * @see {@link usePaymentMethods} for viewing all payment methods
 * @see {@link useSetDefaultPaymentMethod} for managing default before deletion
 */
export function useDeletePaymentMethod(
  options?: Omit<
    UseMutationOptions<
      void,
      ApiErrorResponse,
      string,
      { previousMethods: PaymentMethod[] | undefined }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentService.deletePaymentMethod(paymentMethodId),

    onMutate: async (paymentMethodId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentMethods.lists() });

      // Snapshot
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(
        queryKeys.paymentMethods.lists()
      );

      // Optimistically remove the payment method
      queryClient.setQueryData<PaymentMethod[]>(
        queryKeys.paymentMethods.lists(),
        (old = []) => old.filter((method) => method.id !== paymentMethodId)
      );

      return { previousMethods };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMethods) {
        queryClient.setQueryData(queryKeys.paymentMethods.lists(), context.previousMethods);
      }
      toast.error(error.message || 'Failed to delete payment method');
    },

    onSuccess: () => {
      toast.success('Payment method deleted successfully!');
    },

    ...options,
  });
}
