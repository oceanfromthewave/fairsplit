-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "currency" SET DEFAULT 'KRW';

UPDATE "Expense" SET "currency" = 'KRW' WHERE "currency" = 'USD';
