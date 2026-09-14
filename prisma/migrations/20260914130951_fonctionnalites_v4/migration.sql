-- AlterTable
ALTER TABLE "journal_audit" ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "donneesAvant" JSONB;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "antecedents" TEXT;

-- CreateTable
CREATE TABLE "pieces_jointes" (
    "id" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "typeMime" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "contenu" BYTEA NOT NULL,
    "consultationId" TEXT NOT NULL,
    "ajouteParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pieces_jointes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pieces_jointes_consultationId_idx" ON "pieces_jointes"("consultationId");

-- CreateIndex
CREATE INDEX "journal_audit_documentId_idx" ON "journal_audit"("documentId");

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_ajouteParId_fkey" FOREIGN KEY ("ajouteParId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
