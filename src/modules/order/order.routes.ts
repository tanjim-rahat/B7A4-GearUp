import { Router } from "express";
import {
  confirmOrderController,
  fetchOrderByIdController,
  fetchOrdersController,
  placeOrderController,
  updateOrderStatusController,
} from "./order.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/client";

const router: Router = Router();

// RENTAL ORDER PLACING FOR CUSTOMER
router.post(
  "/",
  authenticateUser,
  authorizeRoles(Role.CUSTOMER),
  placeOrderController,
);

router.get(
  "/",
  authenticateUser,
  authorizeRoles(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  fetchOrdersController,
);

router.get("/:orderId", authenticateUser, fetchOrderByIdController);

router.patch(
  "/status",
  authenticateUser,
  authorizeRoles(Role.PROVIDER, Role.CUSTOMER),
  updateOrderStatusController,
);

// CONFIRM ORDER FOR CUSTOMER
router.get(
  "/:orderId/confirm",
  authenticateUser,
  authorizeRoles(Role.CUSTOMER),
  confirmOrderController,
);

export default router;
