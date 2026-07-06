import type { Request, Response, NextFunction } from "express";
import statusCodes from "http-status";
import { createUser } from "./user.services";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res
        .status(statusCodes.BAD_REQUEST)
        .json({ error: "Missing required registration fields" });
      return;
    }

    if (!emailRegex.test(email)) {
      res
        .status(statusCodes.BAD_REQUEST)
        .json({ error: "Invalid email format" });
      return;
    }

    const user = await createUser({ email, password, name, role });

    res
      .status(statusCodes.CREATED)
      .json({ message: "User registered successfully", user });
  } catch (error: any) {
    console.error(error);
    res.status(statusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
