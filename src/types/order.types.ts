import type { OrderStatus } from "../../generated/prisma/client";

export interface OrderItemInput {
  gearItemId: string;
  quantity: number;
  priceAtRental: number;
}

export interface CreateRentalOrderInput {
  customerId: string;
  startDate: string;
  endDate: string;
  items: OrderItemInput[];
}

export interface UpdateOrderStatusInput {
  orderId: string;
  providerId: string;
  status: OrderStatus;
}
