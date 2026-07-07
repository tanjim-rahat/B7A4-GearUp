import type { Request, Response, NextFunction } from "express";
import { createGearItem } from "./gear.services";
import type { CreateGearInput } from "../../types/gear.types";

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
      .json({ message: "Inventory item added successfully", gear: newItem });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
