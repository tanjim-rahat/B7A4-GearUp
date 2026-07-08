import type { Request, Response, NextFunction } from "express";
import { createRentalOrder, fetchOrders } from "./order.services";
import type { Role } from "../../../generated/prisma/client";

export const placeOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, items } = req.body;
    if (!req.user || !startDate || !endDate || !items || !items.length) {
      res.status(400).json({ error: "Missing required order fields" });
      return;
    }

    const order = await createRentalOrder({
      customerId: req.user.id,
      startDate,
      endDate,
      items,
    });

    res.status(201).json({ message: "Rental placed successfully", order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return;

    const orders = await fetchOrders(req.user.id, req.user.role as Role);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
