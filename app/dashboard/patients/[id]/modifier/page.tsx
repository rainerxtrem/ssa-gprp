import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import PatientForm from "@/components/patients/PatientForm";

export default async function ModifierPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutEcrireDossierMedical(session!.user.role)) {
    redirect(`/dashboard/patients/${id}`);
  }

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  return (
    <div>
      <PageHeader
        title="Modifier le patient"
        description={`${patient.grade} ${patient.nom} ${patient.prenom}`}
        backHref={`/dashboard/patients/${patient.id}`}
        backLabel="Retour au dossier"
      />
      <PatientForm
        mode="modifier"
        patientId={patient.id}
        valeursInitiales={{
          rio: patient.rio,
          nom: patient.nom,
          prenom: patient.prenom,
          ddn: patient.ddn.toISOString().slice(0, 10),
          grade: patient.grade,
          specialite: patient.specialite ?? "",
          unite: patient.unite,
          antecedents: patient.antecedents ?? "",
          allergies: patient.allergies ?? "",
        }}
      />
    </div>
  );
}
