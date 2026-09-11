import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isCommandement, isMedecin, isParamedical } from "@/lib/auth-guards";
import { listerPatientsPourRole } from "@/lib/patients";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const vue = await listerPatientsPourRole(role);

  const nbPatients = vue.mode === "commandement" ? vue.syntheses.length : vue.patients.length;
  const enRetard =
    vue.mode === "commandement" ? vue.syntheses.filter((s) => s.statutVisite === "En retard").length : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-slate-500">
          {isCommandement(role) && "Vue commandement — statuts uniquement, secret médical strict."}
          {isMedecin(role) && "Accès complet au dossier médical et aux certificats d'aptitude."}
          {isParamedical(role) && "Lecture du dossier médical et saisie des constantes."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CarteStat label="Patients suivis" valeur={nbPatients} />
        {vue.mode === "commandement" && <CarteStat label="Visites en retard" valeur={enRetard ?? 0} alerte />}
        {vue.mode === "complet" && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Action rapide</p>
            {isMedecin(role) && (
              <Link href="/dashboard/patients/nouveau" className="mt-1 block font-medium text-emerald-700 hover:underline">
                + Ajouter un patient
              </Link>
            )}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/patients"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Voir la liste des patients
      </Link>
    </div>
  );
}

function CarteStat({ label, valeur, alerte = false }: { label: string; valeur: number; alerte?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${alerte && valeur > 0 ? "text-red-600" : "text-slate-900"}`}>
        {valeur}
      </p>
    </div>
  );
}
