/**
 * Stripe Configuration
 * Initializes and exports the Stripe instance for payment processing
 */

import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with the publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
