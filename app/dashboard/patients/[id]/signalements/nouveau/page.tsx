import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutSignalerInaptitude } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import SignalementForm from "./SignalementForm";

export default async function NouveauSignalementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutSignalerInaptitude(session!.user.role)) {
    redirect(`/dashboard/patients/${id}`);
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, nom: true, prenom: true, grade: true },
  });
  if (!patient) notFound();

  return (
    <div>
      <PageHeader
        title="Signaler une suspicion d'inaptitude"
        description={`${patient.grade} ${patient.nom} ${patient.prenom}`}
        backHref={`/dashboard/patients/${patient.id}?onglet=aptitudes`}
        backLabel="Retour au dossier"
      />
      <SignalementForm patientId={patient.id} />
    </div>
  );
}
