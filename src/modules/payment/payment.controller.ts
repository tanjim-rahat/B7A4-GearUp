import type { NextFunction, Request, Response } from "express";
import { stripeClient } from "../../lib/stripe";
import stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { config } from "../../config";
import statusCodes from "http-status-codes";
import { PaymentStatus } from "../../../generated/prisma/client";
import { fetchPayments } from "./payment.services";

export const successPageController = (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
      </head>
      <body>
        <h1>Payment Successful</h1>
        <p>Thank you for your payment. Your order has been confirmed.</p>
      </body>
    </html>
  `);
};

export const cancelPageController = (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Payment Cancelled</title>
      </head>
      <body>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed. Please try again.</p>
      </body>
    </html>
  `);
};

export const stripeWebhookController = async (
  req: Request,
  res: Response,
  Next: NextFunction,
) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      config.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      const order = await prisma.order.update({
        where: { id: orderId! },
        data: { status: "PAID" },

        select: { totalPrice: true },
      });

      await prisma.payment.create({
        data: {
          orderId: orderId!,
          stripeSessionId: session.id,
          amount: order.totalPrice,
          status: PaymentStatus.PENDING,
        },
      });
    }

    res.sendStatus(statusCodes.OK);
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const fetchPaymentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const payments = await fetchPayments(userId);
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
