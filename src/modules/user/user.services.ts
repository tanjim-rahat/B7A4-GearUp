import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import type { RegisterUserInput } from "../../types/user.types";
import { Role, type User } from "../../../generated/prisma/client";

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
