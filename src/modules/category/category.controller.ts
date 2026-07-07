import type { Request, Response, NextFunction } from "express";
import { createCategory } from "./category.services";

export const addCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      res
        .status(400)
        .json({ error: "A valid category string name payload is required" });
      return;
    }

    const newCategory = await createCategory(name);

    res.status(201).json({
      message: "Gear category successfully established",
      category: newCategory,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
