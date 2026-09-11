import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical } from "@/lib/auth-guards";
import NouveauPatientForm from "./NouveauPatientForm";

export default async function NouveauPatientPage() {
  const session = await getServerSession(authOptions);
  if (!peutEcrireDossierMedical(session!.user.role)) {
    redirect("/dashboard/patients");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nouveau patient</h1>
      <NouveauPatientForm />
    </div>
  );
}
