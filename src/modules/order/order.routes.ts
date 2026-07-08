import { Router } from "express";
import {
  fetchAllOrdersController,
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
