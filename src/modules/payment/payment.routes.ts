import { Router } from "express";

import {
  successPageController,
  cancelPageController,
} from "./payment.controller";

const router: Router = Router();

router.get("/success", successPageController);
router.get("/cancel", cancelPageController);

export default router;
