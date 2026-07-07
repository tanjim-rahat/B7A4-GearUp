import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./modules/user/user.route";
import categoryRouter from "./modules/category/category.route";

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

export default app;
