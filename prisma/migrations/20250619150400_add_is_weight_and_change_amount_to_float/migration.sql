-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isWeight" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
