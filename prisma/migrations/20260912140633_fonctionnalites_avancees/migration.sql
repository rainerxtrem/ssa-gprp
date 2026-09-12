/*
  Warnings:

  - Added the required column `updatedAt` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatutConvocation" AS ENUM ('PLANIFIEE', 'HONOREE', 'ANNULEE', 'ABSENT');

-- AlterTable
ALTER TABLE "certificats_engagement" ADD COLUMN     "annuleLe" TIMESTAMP(3),
ADD COLUMN     "annuleMotif" TEXT;

-- AlterTable
ALTER TABLE "certificats_suivi_aptitudes" ADD COLUMN     "annuleLe" TIMESTAMP(3),
ADD COLUMN     "annuleMotif" TEXT;

-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "annuleLe" TIMESTAMP(3),
ADD COLUMN     "annuleMotif" TEXT;

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "annuleLe" TIMESTAMP(3),
ADD COLUMN     "annuleMotif" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "convocations" (
    "id" TEXT NOT NULL,
    "dateConvocation" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "statut" "StatutConvocation" NOT NULL DEFAULT 'PLANIFIEE',
    "medecinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "patientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "convocations_patientId_idx" ON "convocations"("patientId");

-- CreateIndex
CREATE INDEX "journal_audit_patientId_idx" ON "journal_audit"("patientId");

-- AddForeignKey
ALTER TABLE "convocations" ADD CONSTRAINT "convocations_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convocations" ADD CONSTRAINT "convocations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
