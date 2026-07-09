/*
  Warnings:

  - You are about to drop the column `paidAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paidAt",
DROP COLUMN "status",
DROP COLUMN "stripePaymentIntentId";
