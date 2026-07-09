import type { Request, Response, NextFunction } from "express";
import { createCategory, fetchAllCategories } from "./category.services";

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
      success: true,
      message: "Gear category successfully established",
      data: newCategory,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await fetchAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
