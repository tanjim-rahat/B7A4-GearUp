import {
  OrderStatus,
  PaymentStatus,
  Role,
  type Order,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "../../types/order.types";
import { createStripeSession } from "../payment/payment.services";

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  const timeDifference = end.getTime() - start.getTime();
  const rentalDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (rentalDays <= 0) {
    throw new Error("End date must be at least 1 day after the start date.");
  }

  const gearItem = await prisma.gearItem.findUnique({
    where: { id: input.gearItemId },
  });

  if (!gearItem) {
    throw new Error("Gear item not found.");
  }

  // Resolve item validation and snapshot dynamic current pricing
  const totalOrderPrice = input.quantity * rentalDays * gearItem.pricePerDay;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId: input.customerId,
        gearItemId: input.gearItemId,
        startDate: start,
        endDate: end,
        totalPrice: totalOrderPrice,
        quantity: input.quantity,
      },
    });

    return order;
  });
};

export const fetchOrders = async (
  userId: string,
  role: Role,
): Promise<Order[]> => {
  if (role === Role.PROVIDER) {
    return prisma.order.findMany({
      where: {
        gearItem: {
          providerId: userId,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.order.findMany({
    where: { customerId: userId },
    include: {
      payment: true,
      gearItem: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const fetchOrderById = async (
  orderId: string,
  userId: string,
): Promise<Partial<Order> | null> => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ customerId: userId }, { gearItem: { providerId: userId } }],
    },

    omit: {
      gearItemId: true,
      createdAt: true,
      updatedAt: true,
    },

    include: {
      gearItem: {
        omit: {
          createdAt: true,
          updatedAt: true,
          categoryId: true,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      payment: true,
    },
  });
};

export const updateOrderStatus = async (
  input: UpdateOrderStatusInput,
): Promise<Order> => {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { gearItem: true },
  });

  if (!order) throw new Error("Order not found");

  const userOwnsGear = order.gearItem.providerId === input.providerId;

  if (!userOwnsGear) {
    throw new Error("Unauthorized status modification attempt");
  }

  return prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
  });
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  return prisma.order.findMany({
    include: {
      gearItem: {
        include: {
          category: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const confirmOrder = async (orderId: string): Promise<string> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new Error("Order not found");

  const stripeSession = await createStripeSession(order.id, order.totalPrice);

  return stripeSession.url as string;
};
