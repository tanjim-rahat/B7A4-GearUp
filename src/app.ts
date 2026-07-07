import express, { type Application } from "express";
import cors from "cors";

import userRouter from "./modules/user/user.route";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);

export default app;
