import type { Request, Response, NextFunction } from "express";
import { createRentalOrder } from "./order.services";

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
