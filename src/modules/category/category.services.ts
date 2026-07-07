import type { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createCategory = async (name: string): Promise<Category> => {
  const normalizedName = name.trim();

  // Enforce uniqueness validation proactively
  const existingCategory = await prisma.category.findUnique({
    where: { name: normalizedName },
  });

  if (existingCategory) {
    throw new Error("A category with this exact name already exists");
  }

  return prisma.category.create({
    data: { name: normalizedName },
  });
};

export const fetchAllCategories = async (): Promise<
  Pick<Category, "id" | "name">[]
> => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
};
