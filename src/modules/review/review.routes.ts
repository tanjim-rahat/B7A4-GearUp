import { Router } from "express";
import { addReviewController } from "./review.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post(
  "/:orderId",
  authenticateUser,
  authorizeRoles(Role.CUSTOMER),
  addReviewController,
);

export default router;
