import { type GearItem } from "../../generated/prisma/client";

export type CreateGearInput = Omit<GearItem, "id" | "createdAt" | "updatedAt">;

export type UpdateGearInput = Partial<CreateGearInput>;
