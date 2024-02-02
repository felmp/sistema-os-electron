/*
  Warnings:

  - Added the required column `description` to the `Installments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installments_quantity` to the `PendingBills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Installments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "is_paid" BOOLEAN NOT NULL,
    "payment_date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "pending_bill_id" INTEGER NOT NULL,
    CONSTRAINT "Installments_pending_bill_id_fkey" FOREIGN KEY ("pending_bill_id") REFERENCES "PendingBills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Installments" ("id", "is_paid", "payment_date", "pending_bill_id", "price") SELECT "id", "is_paid", "payment_date", "pending_bill_id", "price" FROM "Installments";
DROP TABLE "Installments";
ALTER TABLE "new_Installments" RENAME TO "Installments";
CREATE TABLE "new_PendingBills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "installments_quantity" INTEGER NOT NULL
);
INSERT INTO "new_PendingBills" ("description", "due_date", "id", "price", "title") SELECT "description", "due_date", "id", "price", "title" FROM "PendingBills";
DROP TABLE "PendingBills";
ALTER TABLE "new_PendingBills" RENAME TO "PendingBills";
CREATE TABLE "new_Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "os_id" INTEGER,
    CONSTRAINT "Service_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "Os" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("description", "id", "os_id", "price", "quantity") SELECT "description", "id", "os_id", "price", "quantity" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
