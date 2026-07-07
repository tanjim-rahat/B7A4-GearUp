import { Router } from "express";
import {
  getCurrentUserController,
  loginUserController,
  registerUserController,
} from "./user.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router: Router = Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/me", authenticateUser, getCurrentUserController);

export default router;
