-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEDECIN_CHEF', 'MEDECIN_PRINCIPAL', 'MEDECIN_ARMES', 'INTERNE_MEDECINE', 'EXTERNE_MEDECINE', 'CADRE_SANTE', 'INFIRMIER_MAJOR', 'INFIRMIER_ANESTHESISTE', 'INFIRMIER', 'ETUDIANT_INFIRMIER', 'COMMANDEMENT');

-- CreateEnum
CREATE TYPE "AptitudeStatus" AS ENUM ('APTE', 'APTE_RESTRICTION', 'INAPTE', 'NON_EVALUE');

-- CreateEnum
CREATE TYPE "ConclusionEngagement" AS ENUM ('APTE_ENGAGEMENT', 'INAPTE_TEMPORAIRE', 'INAPTE', 'AJOURNEMENT');

-- CreateEnum
CREATE TYPE "ConclusionSuivi" AS ENUM ('APTE_A_SERVIR', 'APTE_A_SERVIR_AVEC_RESTRICTION', 'INAPTE_TEMPORAIRE_A_SERVIR', 'INAPTE_DEFINITIF_A_SERVIR');

-- CreateEnum
CREATE TYPE "TypeExemption" AS ENUM ('ARRET_TRAVAIL', 'EXEMPTION_SPORT', 'EXEMPTION_SERVICE', 'PERMISSION_EXCEPTIONNELLE', 'CONVALESCENCE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "grade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "rio" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "ddn" TIMESTAMP(3) NOT NULL,
    "grade" TEXT NOT NULL,
    "specialite" TEXT,
    "unite" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profils_sigycop" (
    "id" TEXT NOT NULL,
    "s" INTEGER NOT NULL DEFAULT 1,
    "i" INTEGER NOT NULL DEFAULT 1,
    "g" INTEGER NOT NULL DEFAULT 1,
    "y" INTEGER NOT NULL DEFAULT 1,
    "c" INTEGER NOT NULL DEFAULT 1,
    "o" INTEGER NOT NULL DEFAULT 1,
    "p" INTEGER NOT NULL DEFAULT 1,
    "dateEvaluation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medecinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profils_sigycop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificats_engagement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "ddn" TIMESTAMP(3) NOT NULL,
    "rio" TEXT NOT NULL,
    "s" INTEGER NOT NULL,
    "i" INTEGER NOT NULL,
    "g" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "c" INTEGER NOT NULL,
    "o" INTEGER NOT NULL,
    "p" INTEGER NOT NULL,
    "aptitudeGeneraleSPP" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeInitialeGES" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeMIR" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeGRIMP" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeNRBCe" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeGHSC" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "conduiteGroupeLeger" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "conduiteGroupeLourd" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "opex" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "contreIndicationEPMS" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "conclusion" "ConclusionEngagement" NOT NULL,
    "lieu" TEXT NOT NULL,
    "dateCertificat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf" BYTEA,
    "pdfGenereLe" TIMESTAMP(3),
    "medecinId" TEXT NOT NULL,
    "medecinSignature" TEXT,
    "patientId" TEXT NOT NULL,
    "profilSigycopId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificats_engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificats_suivi_aptitudes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "ddn" TIMESTAMP(3) NOT NULL,
    "rio" TEXT NOT NULL,
    "s" INTEGER NOT NULL,
    "i" INTEGER NOT NULL,
    "g" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "c" INTEGER NOT NULL,
    "o" INTEGER NOT NULL,
    "p" INTEGER NOT NULL,
    "aptitudeGeneraleSPP" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeInitialeGES" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeMIR" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeGRIMP" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeNRBCe" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "aptitudeGHSC" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "conduiteGroupeLeger" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "conduiteGroupeLourd" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "opex" "AptitudeStatus" NOT NULL DEFAULT 'NON_EVALUE',
    "contreIndicationEPMS" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "conclusion" "ConclusionSuivi" NOT NULL,
    "lieu" TEXT NOT NULL,
    "dateCertificat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf" BYTEA,
    "pdfGenereLe" TIMESTAMP(3),
    "medecinId" TEXT NOT NULL,
    "medecinSignature" TEXT,
    "patientId" TEXT NOT NULL,
    "profilSigycopId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificats_suivi_aptitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "medicaments" JSONB NOT NULL,
    "posologie" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "instructions" TEXT,
    "datePrescription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medecinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrets_travail" (
    "id" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "typeExemption" "TypeExemption" NOT NULL,
    "motif" TEXT,
    "transmisCommandement" BOOLEAN NOT NULL DEFAULT false,
    "medecinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arrets_travail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_rio_key" ON "patients"("rio");

-- CreateIndex
CREATE INDEX "profils_sigycop_patientId_idx" ON "profils_sigycop"("patientId");

-- CreateIndex
CREATE INDEX "certificats_engagement_patientId_idx" ON "certificats_engagement"("patientId");

-- CreateIndex
CREATE INDEX "certificats_suivi_aptitudes_patientId_idx" ON "certificats_suivi_aptitudes"("patientId");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "arrets_travail_patientId_idx" ON "arrets_travail"("patientId");

-- AddForeignKey
ALTER TABLE "profils_sigycop" ADD CONSTRAINT "profils_sigycop_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profils_sigycop" ADD CONSTRAINT "profils_sigycop_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_engagement" ADD CONSTRAINT "certificats_engagement_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_engagement" ADD CONSTRAINT "certificats_engagement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_engagement" ADD CONSTRAINT "certificats_engagement_profilSigycopId_fkey" FOREIGN KEY ("profilSigycopId") REFERENCES "profils_sigycop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_suivi_aptitudes" ADD CONSTRAINT "certificats_suivi_aptitudes_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_suivi_aptitudes" ADD CONSTRAINT "certificats_suivi_aptitudes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats_suivi_aptitudes" ADD CONSTRAINT "certificats_suivi_aptitudes_profilSigycopId_fkey" FOREIGN KEY ("profilSigycopId") REFERENCES "profils_sigycop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrets_travail" ADD CONSTRAINT "arrets_travail_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrets_travail" ADD CONSTRAINT "arrets_travail_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
