-- CreateTable
CREATE TABLE "PendingBills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "price" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Installments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "is_paid" BOOLEAN NOT NULL,
    "payment_date" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "pending_bill_id" INTEGER NOT NULL,
    CONSTRAINT "Installments_pending_bill_id_fkey" FOREIGN KEY ("pending_bill_id") REFERENCES "PendingBills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
