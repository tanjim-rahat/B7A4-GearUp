import { Router } from "express";
import {
  fetchGearItemsController,
  createGearItemController,
  updateGearItemController,
  removeGearItemController,
  fetchGearItemDetailsController,
} from "./gear.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";

const router: Router = Router();

router.get("/", fetchGearItemsController);
router.get("/:id", fetchGearItemDetailsController);

router.post(
  "/",
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

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles(Role.PROVIDER),
  removeGearItemController,
);

export default router;
