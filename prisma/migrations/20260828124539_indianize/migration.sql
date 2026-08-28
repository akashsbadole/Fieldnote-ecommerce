-- AlterTable
ALTER TABLE "StoreSettings" ALTER COLUMN "currency" SET DEFAULT 'INR',
ALTER COLUMN "addressLine" SET DEFAULT '142, MG Road, Bengaluru, KA 560001',
ALTER COLUMN "freeShippingThreshold" SET DEFAULT 50000,
ALTER COLUMN "flatShippingRate" SET DEFAULT 7000,
ALTER COLUMN "expressShippingRate" SET DEFAULT 18000,
ALTER COLUMN "defaultTaxPercent" SET DEFAULT 18;
