import stripe from "stripe";
import { config } from "../config";

export const stripeClient = new stripe(config.STRIPE_SECRET_KEY);
