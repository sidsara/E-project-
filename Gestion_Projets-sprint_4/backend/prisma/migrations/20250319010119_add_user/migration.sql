-- DropForeignKey
ALTER TABLE "Projet" DROP CONSTRAINT "Projet_sujetId_fkey";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "equipeId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "Sujet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
