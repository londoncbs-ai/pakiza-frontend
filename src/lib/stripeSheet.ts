/**
 * Native Stripe PaymentSheet wrapper for the flows where Stripe is
 * store-policy-compliant: charitable donations and meeting fees (real-world
 * services). Digital goods (subscriptions, boosts) must NEVER come through
 * here - they use native store billing.
 *
 * The backend checkout endpoints return {mode, client_secret,
 * publishable_key}. In 'stripe' mode we present the PaymentSheet and give
 * back the payment_intent_id for the server-side confirm/verify step. In
 * 'dev' mode (no Stripe keys locally) there is nothing to present.
 */

export type StripeCheckoutSession = {
  mode: string;
  client_secret: string | null;
  publishable_key: string | null;
};

/** Error thrown when the member closes the sheet without paying. */
export class PaymentCancelledError extends Error {
  constructor(message = 'Payment cancelled') {
    super(message);
    this.name = 'PaymentCancelledError';
    Object.setPrototypeOf(this, PaymentCancelledError.prototype);
  }
}

/**
 * Present the PaymentSheet for a checkout session. Resolves with the
 * payment_intent_id to send to the confirm endpoint (null in dev mode).
 */
export async function presentStripePayment(
  session: StripeCheckoutSession,
): Promise<string | null> {
  if (session.mode !== 'stripe') return null;
  if (!session.client_secret || !session.publishable_key) {
    throw new Error('Payment session is incomplete');
  }

  let stripe: any;
  try {
    stripe = require('@stripe/stripe-react-native');
  } catch {
    throw new Error(
      'Stripe native module is not available in this build. Please run the app using a development build (expo run:ios or EAS build) to process card payments.'
    );
  }

  await stripe.initStripe({
    publishableKey: session.publishable_key,
    merchantIdentifier: 'merchant.app.pakiza.mobile',
    urlScheme: 'pakiza',
  });

  const init = await stripe.initPaymentSheet({
    paymentIntentClientSecret: session.client_secret,
    merchantDisplayName: 'Pakiza',
    applePay: {
      merchantCountryCode: 'GB',
    },
    defaultBillingDetails: {
      address: {
        country: 'GB',
      },
    },
    returnURL: 'pakiza://stripe-redirect',
    appearance: {
      colors: {
        primary: '#800020',
      },
      primaryButton: {
        colors: {
          background: '#800020',
          text: '#FFFFFF',
        },
      },
    },
  });
  if (init.error) throw new Error(init.error.message);

  const result = await stripe.presentPaymentSheet();
  if (result.error) {
    if (result.error.code === 'Canceled') throw new PaymentCancelledError();
    throw new Error(result.error.message);
  }

  // client_secret is "pi_xxx_secret_yyy"; the confirm endpoints want the
  // PaymentIntent id.
  return session.client_secret.split('_secret')[0];
}
