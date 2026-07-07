import type { Request, Response, NextFunction } from "express";
import {
  createGearItem,
  fetchGearItems,
  removeGearItem,
  updateGearItem,
} from "./gear.services";
import type { CreateGearInput, GearFilters } from "../../types/gear.types";

export const fetchGearItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { category, brand, minPrice, maxPrice } = req.query;

    const filters: GearFilters = {
      category: category as string,
      brand: brand as string,
    };

    if (filters.minPrice !== undefined) {
      filters.minPrice = Number(minPrice);
    }

    if (filters.maxPrice !== undefined) {
      filters.maxPrice = Number(maxPrice);
    }

    const gear = await fetchGearItems(filters);
    res.status(200).json(gear);
  } catch (error) {
    next(error);
  }
};

export const createGearItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, brand, pricePerDay, stock, categoryId } =
      req.body;

    if (!title || !brand || !pricePerDay || !stock || !categoryId) {
      res
        .status(400)
        .json({ error: "Missing required fields for gear item creation" });
      return;
    }

    const newItem = await createGearItem({
      title,
      description,
      brand,
      pricePerDay: Number(pricePerDay),
      stock: Number(stock),
      categoryId,
      providerId: req.user?.id,
    } as CreateGearInput);

    res
      .status(201)
      .json({ message: "Gear item added successfully", gear: newItem });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateGearItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "PROVIDER") {
      res.status(403).json({ error: "Access denied. Providers only." });
      return;
    }

    const { id } = req.params;
    const updatedItem = await updateGearItem(
      id as string,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      message: "Gear item updated successfully",
      gear: updatedItem,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeGearItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "PROVIDER") {
      res.status(403).json({ error: "Access denied. Providers only." });
      return;
    }

    const { id } = req.params;
    await removeGearItem(id as string, req.user.id);

    res.status(200).json({ message: "Gear item successfully removed" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
