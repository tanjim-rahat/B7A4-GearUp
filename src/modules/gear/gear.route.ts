import { Router } from "express";
import { createGearItemController } from "./gear.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";

const router: Router = Router();

router.post(
  "/create",
  authenticateUser,
  authorizeRoles(Role.PROVIDER),
  createGearItemController,
);

export default router;
