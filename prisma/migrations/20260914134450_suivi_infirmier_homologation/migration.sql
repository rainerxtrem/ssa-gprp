-- CreateEnum
CREATE TYPE "TypeConsultation" AS ENUM ('MEDICALE', 'SUIVI_INFIRMIER');

-- CreateEnum
CREATE TYPE "StatutSignalement" AS ENUM ('EN_ATTENTE', 'HOMOLOGUE', 'REJETE');

-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "type" "TypeConsultation" NOT NULL DEFAULT 'MEDICALE';

-- CreateTable
CREATE TABLE "signalements_inaptitude" (
    "id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "observations" TEXT,
    "recommandation" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "statut" "StatutSignalement" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaireMedecin" TEXT,
    "traiteLe" TIMESTAMP(3),
    "infirmierId" TEXT NOT NULL,
    "medecinId" TEXT,
    "patientId" TEXT NOT NULL,
    "certificatSuiviId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signalements_inaptitude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unites_referentes" (
    "id" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unites_referentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signalements_inaptitude_certificatSuiviId_key" ON "signalements_inaptitude"("certificatSuiviId");

-- CreateIndex
CREATE INDEX "signalements_inaptitude_patientId_idx" ON "signalements_inaptitude"("patientId");

-- CreateIndex
CREATE INDEX "signalements_inaptitude_statut_idx" ON "signalements_inaptitude"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "unites_referentes_unite_key" ON "unites_referentes"("unite");

-- AddForeignKey
ALTER TABLE "signalements_inaptitude" ADD CONSTRAINT "signalements_inaptitude_infirmierId_fkey" FOREIGN KEY ("infirmierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_inaptitude" ADD CONSTRAINT "signalements_inaptitude_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_inaptitude" ADD CONSTRAINT "signalements_inaptitude_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_inaptitude" ADD CONSTRAINT "signalements_inaptitude_certificatSuiviId_fkey" FOREIGN KEY ("certificatSuiviId") REFERENCES "certificats_suivi_aptitudes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unites_referentes" ADD CONSTRAINT "unites_referentes_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
