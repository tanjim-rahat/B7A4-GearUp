import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import statusCodes from "http-status";
import { Role, UserStatus } from "../../generated/prisma/client";
import { config } from "../config";
import { prisma } from "../lib/prisma";

type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

const extractAccessToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.accessToken;

  if (typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken;
  }

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!config.JWT_SECRET) {
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "JWT secret is not configured" });
      return;
    }

    const token = extractAccessToken(req);

    if (!token) {
      res
        .status(statusCodes.UNAUTHORIZED)
        .json({ error: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      res
        .status(statusCodes.UNAUTHORIZED)
        .json({ error: "Authentication required" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(statusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(statusCodes.UNAUTHORIZED)
        .json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(statusCodes.FORBIDDEN)
        .json({ error: "You are not authorized to access this resource" });
      return;
    }

    next();
  };
};
