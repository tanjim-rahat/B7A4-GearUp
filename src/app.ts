import express, { type Application } from "express";
import cors from "cors";

import userRouter from "./modules/user/user.route";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);

export default app;
