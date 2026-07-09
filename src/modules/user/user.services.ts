import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { config } from "../../config";
import type {
  LoginUserInput,
  LoginUserResult,
  RegisterUserInput,
} from "../../types/user.types";
import { Role, UserStatus, type User } from "../../../generated/prisma/client";

const createAuthTokens = (user: User): Omit<LoginUserResult, "user"> => {
  if (!config.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessTokenExpiresIn = config.JWT_EXPIRES_IN as NonNullable<
    jwt.SignOptions["expiresIn"]
  >;

  const refreshTokenExpiresIn = config.JWT_REFRESH_EXPIRES_IN as NonNullable<
    jwt.SignOptions["expiresIn"]
  >;

  const accessTokenOptions = {
    expiresIn: accessTokenExpiresIn,
  } satisfies jwt.SignOptions;

  const refreshTokenOptions = {
    expiresIn: refreshTokenExpiresIn,
  } satisfies jwt.SignOptions;

  const accessToken = jwt.sign(payload, config.JWT_SECRET, accessTokenOptions);

  const refreshToken = jwt.sign(
    payload,
    config.JWT_REFRESH_SECRET,
    refreshTokenOptions,
  );

  return { accessToken, refreshToken };
};

export const createUser = async (
  input: RegisterUserInput,
): Promise<Pick<User, "id" | "email" | "name" | "role">> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const newUser = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role || Role.CUSTOMER,
    },

    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return newUser;
};

export const loginUser = async (
  input: LoginUserInput,
): Promise<LoginUserResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("User account is not active");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const { accessToken, refreshToken } = createAuthTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const fetchAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { not: Role.ADMIN }, // Exclude admin users
    },
    omit: {
      password: true,
    },
  });

  return users;
};

export const updateUserStatus = async (
  userId: string,
  status: UserStatus,
): Promise<Pick<User, "id" | "email" | "name" | "role" | "status">> => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};
