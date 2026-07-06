import { Role } from "../../generated/prisma/client";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}
