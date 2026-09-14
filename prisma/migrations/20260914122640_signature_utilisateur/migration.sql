-- AlterTable
ALTER TABLE "prescriptions" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "signature" BYTEA,
ADD COLUMN     "signatureAjoutee" TIMESTAMP(3);
