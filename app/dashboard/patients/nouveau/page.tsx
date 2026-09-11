import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/PageHeader";
import PatientForm from "@/components/patients/PatientForm";

export default async function NouveauPatientPage() {
  const session = await getServerSession(authOptions);
  if (!peutEcrireDossierMedical(session!.user.role)) {
    redirect("/dashboard/patients");
  }

  return (
    <div>
      <PageHeader
        title="Nouveau patient"
        backHref="/dashboard/patients"
        backLabel="Retour aux patients"
      />
      <PatientForm mode="creer" />
    </div>
  );
}
