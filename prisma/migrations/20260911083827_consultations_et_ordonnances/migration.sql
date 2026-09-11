/*
  Warnings:

  - You are about to drop the column `duree` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `posologie` on the `prescriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "duree",
DROP COLUMN "posologie",
ADD COLUMN     "pdf" BYTEA,
ADD COLUMN     "pdfGenereLe" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "dateConsultation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT NOT NULL,
    "anamnese" TEXT,
    "examenClinique" TEXT,
    "temperature" DOUBLE PRECISION,
    "tensionSystolique" INTEGER,
    "tensionDiastolique" INTEGER,
    "frequenceCardiaque" INTEGER,
    "saturationO2" INTEGER,
    "poids" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "diagnostic" TEXT,
    "conduiteATenir" TEXT,
    "medecinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultations_patientId_idx" ON "consultations"("patientId");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
