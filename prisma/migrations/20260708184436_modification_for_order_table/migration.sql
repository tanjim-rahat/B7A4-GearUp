/*
  Warnings:

  - You are about to drop the column `gearItemId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `rentalOrderId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_gearItemId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_rentalOrderId_fkey";

-- DropForeignKey
ALTER TABLE "rental_orders" DROP CONSTRAINT "rental_orders_customerId_fkey";

-- DropIndex
DROP INDEX "order_items_rentalOrderId_gearItemId_key";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "gearItemId";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentId";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "rentalOrderId",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
