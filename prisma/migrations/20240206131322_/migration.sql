/*
  Warnings:

  - You are about to drop the `dealer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_vehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_vehicle_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "document_details" DROP CONSTRAINT "document_details_user_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "order_details" DROP CONSTRAINT "order_details_order_id_fkey";

-- DropForeignKey
ALTER TABLE "source" DROP CONSTRAINT "source_dealer_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_source_id_fkey";

-- DropForeignKey
ALTER TABLE "user_details" DROP CONSTRAINT "user_details_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_vehicle" DROP CONSTRAINT "user_vehicle_order_id_fkey";

-- DropForeignKey
ALTER TABLE "user_vehicle" DROP CONSTRAINT "user_vehicle_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_vehicle" DROP CONSTRAINT "user_vehicle_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "user_vehicle_details" DROP CONSTRAINT "user_vehicle_details_user_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_items" DROP CONSTRAINT "vehicle_items_user_vehicle_id_fkey";

-- DropTable
DROP TABLE "dealer";

-- DropTable
DROP TABLE "document_details";

-- DropTable
DROP TABLE "model";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "order_details";

-- DropTable
DROP TABLE "source";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_details";

-- DropTable
DROP TABLE "user_vehicle";

-- DropTable
DROP TABLE "user_vehicle_details";

-- DropTable
DROP TABLE "variant";

-- DropTable
DROP TABLE "vehicle_items";

-- DropEnum
DROP TYPE "address_type";

-- DropEnum
DROP TYPE "order_status";

-- DropEnum
DROP TYPE "payment_status";

-- CreateTable
CREATE TABLE "map_customer" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "order_id" UUID NOT NULL,
    "vehicle_id" UUID,
    "vin" VARCHAR(255),
    "delivery_photos" VARCHAR(500),
    "feedback" VARCHAR(255),
    "tc_document" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    "lock_expires" TIMESTAMP,
    "locked_by" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "track_stage" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "stage" VARCHAR(255) NOT NULL,
    "sub_stage" VARCHAR(255) NOT NULL,
    "created_at" VARCHAR(255) NOT NULL,
    "updated_at" VARCHAR(255) NOT NULL
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" VARCHAR(255) NOT NULL,
    "updated_at" VARCHAR(255) NOT NULL
);

-- CreateTable
CREATE TABLE "payment_info" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount" VARCHAR(255) NOT NULL,
    "proof" VARCHAR(255) NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "method" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "map_customer_id_key" ON "map_customer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "map_customer_order_id_key" ON "map_customer"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_customer_vehicle_id_key" ON "map_customer"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_customer_vin_key" ON "map_customer"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "track_stage_order_id_key" ON "track_stage"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_id_key" ON "payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_order_id_key" ON "payment"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_info_id_key" ON "payment_info"("id");
