import {
  OrderStatus,
  PaymentStatus,
  type RentalOrder,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  CreateRentalOrderInput,
  OrderItemInput,
} from "../../types/order.types";

export const createRentalOrder = async (
  input: CreateRentalOrderInput,
): Promise<RentalOrder> => {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  // Calculate rental duration in days
  const timeDifference = end.getTime() - start.getTime();
  const rentalDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (rentalDays <= 0) {
    throw new Error("End date must be at least 1 day after the start date.");
  }

  // Resolve item validation and snapshot dynamic current pricing
  let totalOrderPrice = 0;
  const processedItems: OrderItemInput[] = [];

  for (const item of input.items) {
    const gear = await prisma.gearItem.findUnique({
      where: { id: item.gearItemId },
    });

    if (!gear || !gear.isAvailable || gear.stock < item.quantity) {
      throw new Error(
        `Gear item ${item.gearItemId} is either unavailable or has insufficient stock.`,
      );
    }

    const itemTotalPrice = gear.pricePerDay * rentalDays * item.quantity;
    totalOrderPrice += itemTotalPrice;

    processedItems.push({
      gearItemId: item.gearItemId,
      quantity: item.quantity,
      priceAtRental: gear.pricePerDay,
    });
  }

  // Execute database atomic transaction across orders, sub-items, and create a Stripe intent
  return prisma.$transaction(async (tx) => {
    // 1. Create primary order record
    const order = await tx.rentalOrder.create({
      data: {
        customerId: input.customerId,
        startDate: start,
        endDate: end,
        totalPrice: totalOrderPrice,
        status: OrderStatus.PLACED,
        items: {
          createMany: {
            data: processedItems,
          },
        },
      },
      include: { items: true },
    });

    // 2. Generate unique local mock Stripe tracking session reference
    const mockStripeSessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;

    await tx.payment.create({
      data: {
        rentalOrderId: order.id,
        stripeSessionId: mockStripeSessionId,
        amount: totalOrderPrice,
        status: PaymentStatus.PENDING,
      },
    });

    return order;
  });
};
