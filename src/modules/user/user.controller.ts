import type { Request, Response, NextFunction } from "express";
import statusCodes from "http-status";
import { config } from "../../config";
import { createUser, getCurrentUser, loginUser } from "./user.services";
import ms, { type StringValue } from "ms";
import { Role } from "../../../generated/prisma/enums";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUserController = async (
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

    // check if role is valid
    const validRoles = [Role.CUSTOMER, Role.PROVIDER];

    if (!validRoles.includes(role)) {
      res
        .status(statusCodes.BAD_REQUEST)
        .json({ error: "Invalid role specified" });
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

export const loginUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(statusCodes.BAD_REQUEST)
        .json({ error: "Missing required login fields" });
      return;
    }

    if (!emailRegex.test(email)) {
      res
        .status(statusCodes.BAD_REQUEST)
        .json({ error: "Invalid email format" });
      return;
    }

    const result = await loginUser({ email, password });

    const isProduction = config.NODE_ENV === "production";

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: ms(config.JWT_EXPIRES_IN as StringValue),
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: ms(config.JWT_REFRESH_EXPIRES_IN as StringValue),
    });

    res.status(statusCodes.OK).json({
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    console.error(error);

    const message = error?.message || "Login failed";
    const status =
      message === "Invalid email or password"
        ? statusCodes.UNAUTHORIZED
        : message === "User account is not active"
          ? statusCodes.FORBIDDEN
          : statusCodes.BAD_REQUEST;

    res.status(status).json({ error: message });
  }
};

export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(statusCodes.UNAUTHORIZED)
        .json({ error: "Authentication required" });
      return;
    }

    const user = await getCurrentUser(req.user.id);

    res.status(statusCodes.OK).json({ user });
  } catch (error: any) {
    console.error(error);
    res.status(statusCodes.NOT_FOUND).json({ error: error.message });
  }
};
