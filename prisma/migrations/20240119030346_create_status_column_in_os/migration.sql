/*
  Warnings:

  - Added the required column `status` to the `Os` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Os" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_name" TEXT NOT NULL,
    "phone" TEXT,
    "plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_Os" ("client_name", "date", "id", "model", "phone", "plate") SELECT "client_name", "date", "id", "model", "phone", "plate" FROM "Os";
DROP TABLE "Os";
ALTER TABLE "new_Os" RENAME TO "Os";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
