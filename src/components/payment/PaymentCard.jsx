import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Star, Plus, X, AlertCircle } from 'lucide-react';
import paymentsService from '../../api/services/payments.service';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Add Card Modal Component
const AddCardModal = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Add payment method to backend
      await paymentsService.addPaymentMethod({
        payment_method_id: paymentMethod.id,
        set_as_default: setAsDefault,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to add payment method:', err);
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-heading-dark font-manrope">
            Add Payment Method
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="accent-btn-gold"
              />
              <span className="text-sm text-gray-700 font-manrope">
                Set as default payment method
              </span>
            </label>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-manrope">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-manrope"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 px-4 py-2 bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed font-manrope"
            >
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentCard = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const methods = await paymentsService.getPaymentMethods();
      setPaymentMethods(methods || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await paymentsService.setDefaultPaymentMethod(methodId);
      await loadPaymentMethods(); // Reload to reflect changes
    } catch (err) {
      console.error('Failed to set default:', err);
      alert('Failed to set default payment method');
    }
  };

  const handleRemove = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      await paymentsService.removePaymentMethod(methodId);
      await loadPaymentMethods();
    } catch (err) {
      console.error('Failed to remove payment method:', err);
      alert('Failed to remove payment method');
    }
  };

  const getCardBrandIcon = (brand) => {
    const brandLogos = {
      visa: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
      mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
      amex: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
      discover: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg',
    };

    const brandName = brand?.toLowerCase();

    if (brandLogos[brandName]) {
      return (
        <img
          src={brandLogos[brandName]}
          alt={brand}
          className="w-10 h-6 object-contain"
        />
      );
    }

    return <CreditCard className="w-6 h-6 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-btn-gold"></div>
        <p className="mt-2 text-gray-600 font-manrope">Loading payment methods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
        <p className="text-red-600 font-manrope">{error}</p>
        <button
          onClick={loadPaymentMethods}
          className="mt-4 text-btn-secondary hover:underline font-manrope"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-heading-dark font-manrope">
          Saved Payment Methods
        </h3>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 transition-colors font-manrope"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 font-manrope">No saved payment methods</p>
          <button
            onClick={() => setShowAddCard(true)}
            className="mt-2 text-btn-secondary hover:underline font-manrope"
          >
            Add your first card
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-btn-gold transition-colors"
            >
              <div className="flex items-center gap-4">
                {getCardBrandIcon(method.brand)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-heading-dark font-manrope">
                      {method.brand?.charAt(0).toUpperCase() + method.brand?.slice(1)} •••• {method.last4}
                    </p>
                    {method.is_default && (
                      <span className="flex items-center gap-1 bg-btn-gold px-2 py-0.5 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-manrope">
                    Expires {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-btn-secondary hover:text-btn-gold transition-colors font-manrope"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove payment method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <Elements stripe={stripePromise}>
          <AddCardModal
            onClose={() => setShowAddCard(false)}
            onSuccess={() => {
              setShowAddCard(false);
              loadPaymentMethods();
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentCard;
