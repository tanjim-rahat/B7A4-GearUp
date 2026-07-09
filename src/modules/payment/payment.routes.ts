import express, { Router } from "express";

import {
  successPageController,
  cancelPageController,
  stripeWebhookController,
  fetchPaymentsController,
} from "./payment.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/client";

const router: Router = Router();

router.get("/success", successPageController);
router.get("/cancel", cancelPageController);

router.post("/webhook", express.raw(), stripeWebhookController);

router.get(
  "/",
  authenticateUser,
  authorizeRoles(Role.CUSTOMER),
  fetchPaymentsController,
);

export default router;
