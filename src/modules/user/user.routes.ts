import { Router } from "express";
import {
  fetchAllUsersController,
  getCurrentUserController,
  loginUserController,
  registerUserController,
} from "./user.controller";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/client";

const router: Router = Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/me", authenticateUser, getCurrentUserController);

router.get(
  "/all",
  authenticateUser,
  authorizeRoles(Role.ADMIN),
  fetchAllUsersController,
);

export default router;
