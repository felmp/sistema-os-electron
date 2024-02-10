-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Installments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "is_paid" BOOLEAN NOT NULL,
    "payment_date" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "pending_bill_id" INTEGER NOT NULL,
    CONSTRAINT "Installments_pending_bill_id_fkey" FOREIGN KEY ("pending_bill_id") REFERENCES "PendingBills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Installments" ("description", "id", "is_paid", "payment_date", "pending_bill_id", "price") SELECT "description", "id", "is_paid", "payment_date", "pending_bill_id", "price" FROM "Installments";
DROP TABLE "Installments";
ALTER TABLE "new_Installments" RENAME TO "Installments";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
