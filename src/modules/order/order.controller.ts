import type { Request, Response, NextFunction } from "express";
import {
  confirmOrder,
  createOrder,
  fetchAllOrders,
  fetchOrderById,
  fetchOrders,
  updateOrderStatus,
} from "./order.services";
import { OrderStatus, Role } from "../../../generated/prisma/client";
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
      res
        .status(400)
        .json({ success: false, error: "Missing required order fields" });
      return;
    }

    const order = await createOrder({
      customerId: req.user.id,
      startDate,
      endDate,
      gearItemId,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Rental Order placed successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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

    res.status(200).json({ success: true, data: orders });
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
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    res.status(200).json({ success: true, data: order });
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

    if (
      req.user?.role === Role.PROVIDER &&
      ![OrderStatus.CONFIRMED, OrderStatus.RETURNED].includes(status)
    ) {
      res
        .status(400)
        .json({ success: false, error: "Invalid status for provider" });
      return;
    }

    if (
      req.user?.role === Role.CUSTOMER &&
      ![OrderStatus.PICKED_UP, OrderStatus.RETURNED].includes(status)
    ) {
      res
        .status(400)
        .json({ success: false, error: "Invalid status for customer" });
      return;
    }

    const updatedOrder = await updateOrderStatus({
      orderId: orderId as string,
      userId: req.user?.id as string,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    next(error);
  }
};

export const fetchAllOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await fetchAllOrders();

    res.status(200).json({ success: true, data: orders });
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

    const checkoutUrl = await confirmOrder(orderId as string, order.totalPrice);

    res.status(200).json({
      success: true,
      message: "Please complete the payment to confirm your order.",
      data: { checkoutUrl },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
