import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import ConsultationForm from "./ConsultationForm";

export default async function NouvelleConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutEcrireDossierMedical(session!.user.role)) {
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
        title="Nouvelle consultation"
        description={`${patient.grade} ${patient.nom} ${patient.prenom}`}
        backHref={`/dashboard/patients/${patient.id}?onglet=suivi`}
        backLabel="Retour au dossier"
      />
      <ConsultationForm patientId={patient.id} />
    </div>
  );
}
