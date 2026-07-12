import Stripe from "stripe";
import { env } from "./env";

function createStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] No STRIPE_SECRET_KEY set. Payment features will be unavailable.");
    return null as unknown as Stripe;
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export const stripe = createStripe();
