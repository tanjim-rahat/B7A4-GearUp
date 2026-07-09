import { config } from "../../config";
import { stripeClient } from "../../lib/stripe";
import stripe from "stripe";

export const createStripeSession = async (
  orderId: string,
  amount: number,
): Promise<stripe.Checkout.Session> => {
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Order #${orderId}` },
          unit_amount: Math.round(amount * 100), // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.APP_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.APP_URL}/api/payment/cancel`,
    metadata: { orderId }, // Used to match the webhook later
  });

  return session;
};
