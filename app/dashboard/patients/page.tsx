import { getServerSession } from "next-auth";
import { UserPlus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { isMedecin } from "@/lib/auth-guards";
import { listerPatientsPourRole } from "@/lib/patients";
import { PageHeader } from "@/components/ui/PageHeader";
import { bouton } from "@/lib/ui";
import Link from "next/link";
import { PatientsTableComplete, PatientsTableCommandement } from "./PatientsTable";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const vue = await listerPatientsPourRole(role);

  return (
    <div>
      <PageHeader
        title="Patients"
        description={vue.mode === "complet" ? "Dossiers médicaux complets" : "Synthèse commandement"}
        action={
          vue.mode === "complet" &&
          isMedecin(role) && (
            <Link href="/dashboard/patients/nouveau" className={bouton("primaire")}>
              <UserPlus className="h-4 w-4" />
              Nouveau patient
            </Link>
          )
        }
      />

      {vue.mode === "complet" ? (
        <PatientsTableComplete patients={vue.patients} />
      ) : (
        <PatientsTableCommandement syntheses={vue.syntheses} />
      )}
    </div>
  );
}
