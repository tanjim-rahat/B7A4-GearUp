import type { Request, Response, NextFunction } from "express";
import {
  createOrder,
  fetchAllOrders,
  fetchOrderById,
  fetchOrders,
  updateOrderStatus,
} from "./order.services";
import type { Role } from "../../../generated/prisma/client";

export const placeOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, gearItemId, quantity } = req.body;
    if (
      !req.user ||
      !startDate ||
      !endDate ||
      !gearItemId ||
      quantity === undefined
    ) {
      res.status(400).json({ error: "Missing required order fields" });
      return;
    }

    const order = await createOrder({
      customerId: req.user.id,
      startDate,
      endDate,
      gearItemId,
      quantity,
    });

    res
      .status(201)
      .json({ message: "Rental Order placed successfully", order });
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

export const fetchOrderByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orderId = req.params.orderId;

    const order = await fetchOrderById(
      orderId as string,
      req.user?.id as string,
      req.user?.role as Role,
    );

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId, status } = req.body;

    const updatedOrder = await updateOrderStatus({
      orderId: orderId as string,
      providerId: req.user?.id as string,
      status,
    });

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchAllOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await fetchAllOrders();

    console.log(orders);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
