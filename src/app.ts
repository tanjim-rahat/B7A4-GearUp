import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./modules/user/user.routes";
import categoryRouter from "./modules/category/category.routes";
import gearRouter from "./modules/gear/gear.routes";
import orderRouter from "./modules/order/order.routes";
import reviewRouter from "./modules/review/review.routes";
import paymentRouter from "./modules/payment/payment.routes";

const app: Application = express();

app.use(
  cors({
    credentials: true,
  }),
);

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/gear", gearRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GearUp API</title>
      </head>
      <body>
        <h1>Welcome to GearUp API</h1>
        <p>GearUp is a backend API for a sports and outdoor equipment rental service. Customers can browse available gear, place rental orders, and return equipment. Providers manage their gear inventory and fulfill rental orders. Admins oversee the platform, manage users, and moderate listings.</p>
      </body>
    </html>
  `);
});

// CATCH ALL ERROR HANDLER
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    details: err.message,
  });
});

export default app;
