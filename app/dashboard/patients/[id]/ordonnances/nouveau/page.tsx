import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutPrescrire } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import OrdonnanceForm, { type OrdonnanceValeurs } from "./OrdonnanceForm";

export default async function NouvelleOrdonnancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dupliquer?: string }>;
}) {
  const { id } = await params;
  const { dupliquer } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!peutPrescrire(session!.user.role)) {
    redirect(`/dashboard/patients/${id}`);
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, nom: true, prenom: true, grade: true, allergies: true },
  });
  if (!patient) notFound();

  let valeursInitiales: OrdonnanceValeurs | undefined;
  let renouvellement = false;

  if (dupliquer) {
    const source = await prisma.prescription.findUnique({ where: { id: dupliquer } });
    if (source && source.patientId === id) {
      const lignes = Array.isArray(source.medicaments)
        ? (source.medicaments as { nom: string; dosage?: string; forme?: string; posologie: string; duree: string }[])
        : [];
      valeursInitiales = {
        medicaments: lignes.map((m) => ({
          nom: m.nom,
          dosage: m.dosage ?? "",
          forme: m.forme ?? "",
          posologie: m.posologie,
          duree: m.duree,
        })),
        instructions: source.instructions ?? "",
        lieu: source.lieu,
      };
      renouvellement = true;
    }
  }

  return (
    <div>
      <PageHeader
        title={renouvellement ? "Renouveler l'ordonnance" : "Nouvelle ordonnance"}
        description={`${patient.grade} ${patient.nom} ${patient.prenom}`}
        backHref={`/dashboard/patients/${patient.id}?onglet=suivi`}
        backLabel="Retour au dossier"
      />
      <OrdonnanceForm patientId={patient.id} valeursInitiales={valeursInitiales} allergiesPatient={patient.allergies} />
    </div>
  );
}
