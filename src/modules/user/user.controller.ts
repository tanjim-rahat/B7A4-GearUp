import type { Request, Response, NextFunction } from "express";
import statusCodes from "http-status";

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

    res
      .status(statusCodes.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(statusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
