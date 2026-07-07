import type { GearItem } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type { CreateGearInput } from "../../types/gear.types";

export const createGearItem = async (
  input: CreateGearInput,
): Promise<GearItem> => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!categoryExists) throw new Error("Target category does not exist");

  return prisma.gearItem.create({
    data: {
      title: input.title,
      description: input.description,
      brand: input.brand,
      pricePerDay: input.pricePerDay,
      stock: input.stock,
      providerId: input.providerId,
      categoryId: input.categoryId,
    },
  });
};
