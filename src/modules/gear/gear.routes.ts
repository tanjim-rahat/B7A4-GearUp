import { Router } from "express";
import {
  fetchGearItemsController,
  createGearItemController,
  updateGearItemController,
} from "./gear.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";

const router: Router = Router();

router.get("/", fetchGearItemsController);

router.post(
  "/create",
  authenticateUser,
  authorizeRoles(Role.PROVIDER),
  createGearItemController,
);
router.patch(
  "/:id",
  authenticateUser,
  authorizeRoles(Role.PROVIDER),
  updateGearItemController,
);

export default router;
