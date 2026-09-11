import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMedecin } from "@/lib/auth-guards";
import { listerPatientsPourRole } from "@/lib/patients";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const vue = await listerPatientsPourRole(role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Patients</h1>
        {vue.mode === "complet" && isMedecin(role) && (
          <Link
            href="/dashboard/patients/nouveau"
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            + Nouveau patient
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {vue.mode === "complet" ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Unité</th>
                <th className="px-4 py-2">RIO</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {vue.patients.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{p.nom}</td>
                  <td className="px-4 py-2">{p.prenom}</td>
                  <td className="px-4 py-2">{p.grade}</td>
                  <td className="px-4 py-2">{p.unite}</td>
                  <td className="px-4 py-2">{p.rio}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/dashboard/patients/${p.id}`} className="text-emerald-700 hover:underline">
                      Ouvrir le dossier
                    </Link>
                  </td>
                </tr>
              ))}
              {vue.patients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Aucun patient enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Unité</th>
                <th className="px-4 py-2">Statut visite</th>
                <th className="px-4 py-2">Statut aptitude</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {vue.syntheses.map((s) => (
                <tr key={s.patientId} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{s.nom}</td>
                  <td className="px-4 py-2">{s.prenom}</td>
                  <td className="px-4 py-2">{s.grade}</td>
                  <td className="px-4 py-2">{s.unite}</td>
                  <td className="px-4 py-2">
                    <BadgeStatutVisite statut={s.statutVisite} />
                  </td>
                  <td className="px-4 py-2">{s.statutAptitude}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/dashboard/patients/${s.patientId}`} className="text-emerald-700 hover:underline">
                      Voir la synthèse
                    </Link>
                  </td>
                </tr>
              ))}
              {vue.syntheses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Aucun patient enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function BadgeStatutVisite({ statut }: { statut: string }) {
  const couleur =
    statut === "À jour"
      ? "bg-emerald-100 text-emerald-800"
      : statut === "En retard"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${couleur}`}>{statut}</span>;
}
