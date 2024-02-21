-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('HOME', 'OFFICE', 'OTHERS');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pre_booked', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'pre_booked', 'delivered');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "primary_vin" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_details" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "address_type" "address_type" NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "pincode" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "payment_status" "payment_status" NOT NULL,
    "order_status" "order_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_details" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "pincode" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" UUID NOT NULL,
    "model_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant" (
    "id" UUID NOT NULL,
    "model_id" VARCHAR(255) NOT NULL,
    "number" VARCHAR(255) NOT NULL,
    "color" VARCHAR(255) NOT NULL,
    "color_hexacode" VARCHAR(255) NOT NULL,

    CONSTRAINT "variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vehicle" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "vin" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vehicle_details" (
    "id" UUID NOT NULL,
    "user_vehicle_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "vehicle_registration" VARCHAR(255) NOT NULL,
    "e_contact_detail" VARCHAR(255) NOT NULL,
    "e_contact_number" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_vehicle_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_items" (
    "id" UUID NOT NULL,
    "user_vehicle_id" UUID NOT NULL,
    "duplicate_key" BOOLEAN NOT NULL,
    "key_number" VARCHAR(255) NOT NULL,
    "spare_wheel_exists" BOOLEAN NOT NULL,
    "tool_kit_exists" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_details" (
    "id" UUID NOT NULL,
    "user_vehicle_id" UUID NOT NULL,
    "sales_invoice_given" BOOLEAN NOT NULL,
    "debit_note" BOOLEAN NOT NULL,
    "customer_receipt" BOOLEAN NOT NULL,
    "insurance_policy" BOOLEAN NOT NULL,
    "rto_tax_paid_receipt" BOOLEAN NOT NULL,
    "fast_tag_given" BOOLEAN NOT NULL,
    "registration_card" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_primary_vin_key" ON "user"("primary_vin");

-- CreateIndex
CREATE UNIQUE INDEX "order_details_order_id_key" ON "order_details"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_order_id_key" ON "user_vehicle"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_vin_key" ON "user_vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_details_user_vehicle_id_key" ON "user_vehicle_details"("user_vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_details_vehicle_registration_key" ON "user_vehicle_details"("vehicle_registration");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_items_user_vehicle_id_key" ON "vehicle_items"("user_vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_details_user_vehicle_id_key" ON "document_details"("user_vehicle_id");

-- AddForeignKey
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vehicle" ADD CONSTRAINT "user_vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "user_vehicle" ADD CONSTRAINT "user_vehicle_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vehicle" ADD CONSTRAINT "user_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "variant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "user_vehicle_details" ADD CONSTRAINT "user_vehicle_details_user_vehicle_id_fkey" FOREIGN KEY ("user_vehicle_id") REFERENCES "user_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_items" ADD CONSTRAINT "vehicle_items_user_vehicle_id_fkey" FOREIGN KEY ("user_vehicle_id") REFERENCES "user_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_details" ADD CONSTRAINT "document_details_user_vehicle_id_fkey" FOREIGN KEY ("user_vehicle_id") REFERENCES "user_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
