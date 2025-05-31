/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nom` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Equipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Equipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Equipe" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "User";
