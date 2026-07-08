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
