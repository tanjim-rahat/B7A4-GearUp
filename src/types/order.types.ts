import type { OrderStatus } from "../../generated/prisma/client";

export interface OrderItemInput {
  gearItemId: string;
  quantity: number;
  priceAtRental: number;
}

export interface CreateOrderInput {
  customerId: string;
  startDate: string;
  endDate: string;
  gearItemId: string;
  quantity: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  providerId: string;
  status: OrderStatus;
}
