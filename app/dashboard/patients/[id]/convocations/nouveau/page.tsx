import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutGenererConvocation } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import ConvocationForm from "./ConvocationForm";

export default async function NouvelleConvocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutGenererConvocation(session!.user.role)) {
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
        title="Nouvelle convocation"
        description={`${patient.grade} ${patient.nom} ${patient.prenom}`}
        backHref={`/dashboard/patients/${patient.id}?onglet=suivi`}
        backLabel="Retour au dossier"
      />
      <ConvocationForm patientId={patient.id} />
    </div>
  );
}
