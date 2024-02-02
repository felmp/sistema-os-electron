/*
  Warnings:

  - Added the required column `status` to the `PendingBills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PendingBills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "installments_quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_PendingBills" ("description", "due_date", "id", "installments_quantity", "price", "title") SELECT "description", "due_date", "id", "installments_quantity", "price", "title" FROM "PendingBills";
DROP TABLE "PendingBills";
ALTER TABLE "new_PendingBills" RENAME TO "PendingBills";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
