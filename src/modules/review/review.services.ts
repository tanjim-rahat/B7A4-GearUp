import type { Review } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type { CreateReviewInput } from "../../types/review.types";

export const addGearReview = async (
  input: CreateReviewInput,
): Promise<Review> => {
  const review = await prisma.review.create({
    data: input,
  });

  return review;
};
