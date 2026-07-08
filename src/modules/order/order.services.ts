import {
  OrderStatus,
  PaymentStatus,
  Role,
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

  return prisma.$transaction(async (tx) => {
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

export const fetchOrders = async (
  userId: string,
  role: Role,
): Promise<RentalOrder[]> => {
  if (role === Role.PROVIDER) {
    return prisma.rentalOrder.findMany({
      where: {
        items: {
          some: { gearItem: { providerId: userId } },
        },
      },
      include: {
        items: {
          include: {
            gearItem: {
              include: {
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.rentalOrder.findMany({
    where: { customerId: userId },
    include: {
      items: {
        include: { gearItem: { include: { category: true } } },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
