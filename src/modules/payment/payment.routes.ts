import express, { Router } from "express";

import {
  successPageController,
  cancelPageController,
  stripeWebhookController,
} from "./payment.controller";

const router: Router = Router();

router.get("/success", successPageController);
router.get("/cancel", cancelPageController);

router.post("/webhook", express.raw(), stripeWebhookController);

export default router;
