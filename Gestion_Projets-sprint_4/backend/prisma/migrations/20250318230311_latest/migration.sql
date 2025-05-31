-- DropForeignKey
ALTER TABLE "Sujet" DROP CONSTRAINT "Sujet_encadrants_fkey";

-- AlterTable
ALTER TABLE "Sujet" ALTER COLUMN "encadrants" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sujet" ADD CONSTRAINT "Sujet_encadrants_fkey" FOREIGN KEY ("encadrants") REFERENCES "equipeEncadrants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
