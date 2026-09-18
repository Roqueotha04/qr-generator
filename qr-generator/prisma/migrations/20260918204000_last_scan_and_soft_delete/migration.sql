-- AlterTable
ALTER TABLE `QrCode` ADD COLUMN `lastScannedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
