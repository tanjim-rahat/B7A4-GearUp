import type { Request, Response, NextFunction } from "express";
import {
  confirmOrder,
  createOrder,
  fetchAllOrders,
  fetchOrderById,
  fetchOrders,
  returnOrder,
  updateOrderStatus,
} from "./order.services";
import type { Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

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

export const confirmOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const checkoutUrl = await confirmOrder(orderId as string);

    res.status(200).json({
      message: "Please complete the payment to confirm your order.",
      checkoutUrl,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const returnOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
    });

    if (!order || order.customerId !== req.user?.id) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const updatedOrder = await returnOrder(orderId as string);

    res.status(200).json({
      message: "Order marked as returned successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
