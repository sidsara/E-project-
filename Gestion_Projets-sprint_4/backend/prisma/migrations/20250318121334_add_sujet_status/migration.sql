/*
  Warnings:

  - You are about to drop the `equipe_encadrants` table. If the table is not empty, all the data it contains will be lost.

*/
/*
A : Clé étrangère vers la table Enseignant.

B : Clé étrangère vers la table equipeEncadrants.
 */
 
-- DropForeignKey
ALTER TABLE "equipe_encadrants" DROP CONSTRAINT "equipe_encadrants_encadrant_id_fkey";

-- DropForeignKey
ALTER TABLE "equipe_encadrants" DROP CONSTRAINT "equipe_encadrants_sujet_id_fkey";

-- AlterTable
ALTER TABLE "Sujet" ADD COLUMN     "document" TEXT;

-- DropTable
DROP TABLE "equipe_encadrants";

-- CreateTable
CREATE TABLE "equipeEncadrants" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "equipeEncadrants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EnseignantToequipeEncadrants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EnseignantToequipeEncadrants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EnseignantToequipeEncadrants_B_index" ON "_EnseignantToequipeEncadrants"("B");

-- AddForeignKey
ALTER TABLE "Sujet" ADD CONSTRAINT "Sujet_encadrants_fkey" FOREIGN KEY ("encadrants") REFERENCES "equipeEncadrants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnseignantToequipeEncadrants" ADD CONSTRAINT "_EnseignantToequipeEncadrants_A_fkey" FOREIGN KEY ("A") REFERENCES "Enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EnseignantToequipeEncadrants" ADD CONSTRAINT "_EnseignantToequipeEncadrants_B_fkey" FOREIGN KEY ("B") REFERENCES "equipeEncadrants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
