import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./modules/user/user.routes";
import categoryRouter from "./modules/category/category.routes";
import gearRouter from "./modules/gear/gear.routes";
import orderRouter from "./modules/order/order.routes";

const app: Application = express();

app.use(
  cors({
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/gear", gearRouter);
app.use("/api/order", orderRouter);

export default app;
