-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "disscusionId" INTEGER NOT NULL,
    CONSTRAINT "Message_disscusionId_fkey" FOREIGN KEY ("disscusionId") REFERENCES "Disscution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Disscution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actor" JSONB NOT NULL
);
