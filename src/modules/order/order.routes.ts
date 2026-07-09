import { Router } from "express";
import {
  fetchAllOrdersController,
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
  authorizeRoles(Role.CUSTOMER, Role.PROVIDER),
  fetchOrdersController,
);

router.get("/:id", authenticateUser, fetchOrderByIdController);

router.patch(
  "/status",
  authenticateUser,
  authorizeRoles(Role.PROVIDER),
  updateOrderStatusController,
);

router.get(
  "/all",
  authenticateUser,
  authorizeRoles(Role.ADMIN),
  fetchAllOrdersController,
);

export default router;
