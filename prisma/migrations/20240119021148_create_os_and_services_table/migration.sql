-- CreateTable
CREATE TABLE "Os" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_name" TEXT NOT NULL,
    "phone" TEXT,
    "plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "date" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "os_id" INTEGER,
    CONSTRAINT "Service_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "Os" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
