import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { addGearReview } from "./review.services";
import { OrderStatus } from "../../../generated/prisma/client";

export const addReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ success: false, error: "Rating must be between 1 and 5" });
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId as string,
      },
    });

    if (!order || order.customerId !== customerId) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    if (order.status !== OrderStatus.RETURNED) {
      res.status(400).json({
        success: false,
        error: "Cannot review an order that is not returned",
      });
      return;
    }

    const review = await addGearReview({
      customerId: customerId!,
      gearItemId: order.gearItemId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
