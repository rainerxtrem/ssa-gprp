import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertTriangle, ArrowRight, ShieldAlert, Stethoscope, UserPlus, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { isCommandement, isMedecin, isParamedical } from "@/lib/auth-guards";
import { listerPatientsPourRole } from "@/lib/patients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const vue = await listerPatientsPourRole(role);

  const nbPatients = vue.mode === "commandement" ? vue.syntheses.length : vue.patients.length;
  const enRetard = vue.mode === "commandement" ? vue.syntheses.filter((s) => s.statutVisite === "En retard").length : 0;

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description={
          isCommandement(role)
            ? "Vue commandement — statuts uniquement, secret médical strict."
            : isMedecin(role)
            ? "Accès complet au dossier médical et aux certificats d'aptitude."
            : "Lecture du dossier médical et saisie des constantes."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Patients suivis" valeur={nbPatients} />
        {vue.mode === "commandement" ? (
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Visites en retard"
            valeur={enRetard}
            alerte={enRetard > 0}
          />
        ) : (
          <StatCard icon={<Stethoscope className="h-5 w-5" />} label="Rôle" valeurTexte="Dossier médical complet" />
        )}

        <Card>
          <CardBody className="flex h-full flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Actions rapides</p>
              <p className="mt-1 text-sm text-slate-400">
                {isMedecin(role) ? "Créer un dossier ou consulter la liste des patients." : "Consulter la liste des patients."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {isMedecin(role) && (
                <Link href="/dashboard/patients/nouveau" className={bouton("secondaire", "sm") + " justify-start"}>
                  <UserPlus className="h-4 w-4" />
                  Ajouter un patient
                </Link>
              )}
              <Link href="/dashboard/patients" className={bouton("primaire", "sm") + " justify-start"}>
                Voir les patients
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {isCommandement(role) && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Secret médical strict : cette vue n&apos;expose jamais de diagnostic, de constante, d&apos;ordonnance
            ou de motif médical — uniquement les statuts d&apos;aptitude et de visite.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  valeur,
  valeurTexte,
  alerte = false,
}: {
  icon: React.ReactNode;
  label: string;
  valeur?: number;
  valeurTexte?: string;
  alerte?: boolean;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`rounded-lg p-2.5 ${alerte ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          {valeur !== undefined ? (
            <p className={`text-2xl font-bold ${alerte ? "text-red-600" : "text-slate-900"}`}>{valeur}</p>
          ) : (
            <p className="font-semibold text-slate-800">{valeurTexte}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
