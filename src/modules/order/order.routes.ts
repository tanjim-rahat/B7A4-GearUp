import { Router } from "express";
import { placeOrderController } from "./order.controller";
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

export default router;
