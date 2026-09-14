import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutPrescrire } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import OrdonnanceForm from "../../nouveau/OrdonnanceForm";

export default async function ModifierOrdonnancePage({
  params,
}: {
  params: Promise<{ id: string; prescriptionId: string }>;
}) {
  const { id, prescriptionId } = await params;
  const session = await getServerSession(authOptions);
  if (!peutPrescrire(session!.user.role)) {
    redirect(`/dashboard/patients/${id}/ordonnances/${prescriptionId}`);
  }

  const prescription = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
  if (!prescription || prescription.patientId !== id) notFound();
  if (prescription.annuleLe) {
    redirect(`/dashboard/patients/${id}/ordonnances/${prescriptionId}`);
  }

  const patient = await prisma.patient.findUnique({ where: { id }, select: { allergies: true } });

  const lignes = Array.isArray(prescription.medicaments)
    ? (prescription.medicaments as { nom: string; dosage?: string; forme?: string; posologie: string; duree: string }[])
    : [];

  return (
    <div>
      <PageHeader
        title="Modifier l'ordonnance"
        backHref={`/dashboard/patients/${id}/ordonnances/${prescriptionId}`}
        backLabel="Retour au détail"
      />
      <OrdonnanceForm
        patientId={id}
        mode="modifier"
        prescriptionId={prescription.id}
        valeursInitiales={{
          medicaments: lignes.map((m) => ({
            nom: m.nom,
            dosage: m.dosage ?? "",
            forme: m.forme ?? "",
            posologie: m.posologie,
            duree: m.duree,
          })),
          instructions: prescription.instructions ?? "",
          lieu: prescription.lieu,
        }}
        allergiesPatient={patient?.allergies}
      />
    </div>
  );
}
