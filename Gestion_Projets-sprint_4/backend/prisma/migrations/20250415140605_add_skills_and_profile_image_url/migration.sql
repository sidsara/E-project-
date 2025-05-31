/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nom` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EquipeStatus" AS ENUM ('INCOMPLET', 'COMPLET');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Equipe" ADD COLUMN     "niveau" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skillsRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialite" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "status" "EquipeStatus" NOT NULL DEFAULT 'INCOMPLET';

-- AlterTable
ALTER TABLE "Etudiant" ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER,
    "equipeId" INTEGER,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
