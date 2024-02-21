/*
  Warnings:

  - You are about to drop the column `payment_status` on the `order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payment_status` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_id` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_default` to the `user_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "payment_status";

-- AlterTable
ALTER TABLE "order_details" ADD COLUMN     "payment_status" "payment_status" NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "source_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_details" ADD COLUMN     "is_default" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "dealer" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "dealer_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_source_id_key" ON "user"("source_id");

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "dealer"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
