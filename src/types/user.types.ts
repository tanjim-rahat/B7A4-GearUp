import { Role, type User } from "../../generated/prisma/client";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

type AuthUser = Pick<User, "id" | "email" | "name" | "role">;

export type LoginUserResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
