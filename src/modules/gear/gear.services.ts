import type { GearItem } from "../../../generated/prisma/client";
import type { GearItemWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
  CreateGearInput,
  GearFilters,
  UpdateGearInput,
} from "../../types/gear.types";

export const fetchGearItems = async (
  filters: GearFilters,
): Promise<GearItem[]> => {
  const whereClause: GearItemWhereInput = { isAvailable: true };

  if (filters.category) {
    whereClause.category = {
      name: { equals: filters.category, mode: "insensitive" },
    };
  }

  if (filters.brand) {
    whereClause.brand = { equals: filters.brand, mode: "insensitive" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    whereClause.pricePerDay = {};
    if (filters.minPrice !== undefined)
      whereClause.pricePerDay.gte = filters.minPrice;
    if (filters.maxPrice !== undefined)
      whereClause.pricePerDay.lte = filters.maxPrice;
  }

  return prisma.gearItem.findMany({
    where: whereClause,
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const fetchGearItemDetails = async (
  id: string,
): Promise<GearItem | null> => {
  return prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      },
    },
  });
};

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

export const updateGearItem = async (
  id: string,
  providerId: string,
  input: UpdateGearInput,
): Promise<GearItem> => {
  const existingItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!existingItem || existingItem.providerId !== providerId) {
    throw new Error(
      "Gear listing not found or unauthorized modification attempt",
    );
  }

  return prisma.gearItem.update({
    where: { id },
    data: input,
  });
};

export const removeGearItem = async (
  id: string,
  providerId: string,
): Promise<GearItem> => {
  const existingItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!existingItem || existingItem.providerId !== providerId) {
    throw new Error("Gear listing not found or unauthorized deletion attempt");
  }

  return prisma.gearItem.delete({ where: { id } });
};
