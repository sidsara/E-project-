/*
  Warnings:

  - Added the required column `encadrants` to the `Sujet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sujet" ADD COLUMN     "encadrants" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "equipe_encadrants" (
    "id" SERIAL NOT NULL,
    "sujet_id" INTEGER NOT NULL,
    "encadrant_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipe_encadrants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "equipe_encadrants" ADD CONSTRAINT "equipe_encadrants_sujet_id_fkey" FOREIGN KEY ("sujet_id") REFERENCES "Sujet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipe_encadrants" ADD CONSTRAINT "equipe_encadrants_encadrant_id_fkey" FOREIGN KEY ("encadrant_id") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
