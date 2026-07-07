import { Router } from "express";

import {
  addCategoryController,
  getCategoriesController,
} from "./category.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/client";

const router: Router = Router();

router.post(
  "/create",
  authenticateUser,
  authorizeRoles(Role.ADMIN),
  addCategoryController,
);

router.get("/all", getCategoriesController);

export default router;
