import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isCommandement, peutSignerCertificatAptitude } from "@/lib/auth-guards";
import { obtenirDossierCompletPatient, obtenirSyntheseCommandementPatient } from "@/lib/patients";
import { CONCLUSION_ENGAGEMENT_LABELS, CONCLUSION_SUIVI_LABELS } from "@/lib/sigycop";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  if (isCommandement(role)) {
    const synthese = await obtenirSyntheseCommandementPatient(id);
    if (!synthese) notFound();

    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-xl font-bold">
          {synthese.grade} {synthese.nom} {synthese.prenom}
        </h1>
        <p className="text-sm text-slate-500">{synthese.unite}</p>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Statut de visite</p>
          <p className="text-lg font-semibold">{synthese.statutVisite}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Statut d&apos;aptitude globale</p>
          <p className="text-lg font-semibold">{synthese.statutAptitude}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm text-slate-500">Arrêts / exemptions transmis</p>
          {synthese.arrets.length === 0 && <p className="text-sm text-slate-400">Aucun</p>}
          <ul className="space-y-1 text-sm">
            {synthese.arrets.map((a, idx) => (
              <li key={idx}>
                {a.typeExemption.replaceAll("_", " ")} — du {a.dateDebut} au {a.dateFin}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs italic text-slate-400">
          Secret médical strict : aucun diagnostic, constante ou ordonnance n&apos;est accessible à ce niveau.
        </p>
      </div>
    );
  }

  const patient = await obtenirDossierCompletPatient(id);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {patient.grade} {patient.nom} {patient.prenom}
          </h1>
          <p className="text-sm text-slate-500">
            {patient.unite} — {patient.specialite || "Sans spécialité"} — RIO {patient.rio}
          </p>
        </div>
        {peutSignerCertificatAptitude(role) && (
          <Link
            href={`/dashboard/patients/${patient.id}/certificats/nouveau`}
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            + Nouveau certificat de suivi
          </Link>
        )}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Historique SIGYCOP</h2>
        {patient.profilsSigycop.length === 0 && (
          <p className="text-sm text-slate-400">Aucune évaluation enregistrée.</p>
        )}
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pr-2">Date</th>
              <th>S</th><th>I</th><th>G</th><th>Y</th><th>C</th><th>O</th><th>P</th>
            </tr>
          </thead>
          <tbody>
            {patient.profilsSigycop.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="pr-2 py-1">{new Date(p.dateEvaluation).toLocaleDateString("fr-FR")}</td>
                <td>{p.s}</td><td>{p.i}</td><td>{p.g}</td><td>{p.y}</td><td>{p.c}</td><td>{p.o}</td><td>{p.p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Certificats de suivi des aptitudes</h2>
        <ListeCertificats
          certificats={patient.certificatsSuivi}
          type="SUIVI"
          labels={CONCLUSION_SUIVI_LABELS}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Certificats d&apos;engagement</h2>
        <ListeCertificats
          certificats={patient.certificatsEngagement}
          type="ENGAGEMENT"
          labels={CONCLUSION_ENGAGEMENT_LABELS}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Arrêts de travail / exemptions</h2>
        {patient.arretsTravail.length === 0 && <p className="text-sm text-slate-400">Aucun</p>}
        <ul className="space-y-1 text-sm">
          {patient.arretsTravail.map((a) => (
            <li key={a.id}>
              {a.typeExemption.replaceAll("_", " ")} — du{" "}
              {new Date(a.dateDebut).toLocaleDateString("fr-FR")} au{" "}
              {new Date(a.dateFin).toLocaleDateString("fr-FR")}
              {a.transmisCommandement && (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  Transmis au commandement
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Prescriptions</h2>
        {patient.prescriptions.length === 0 && <p className="text-sm text-slate-400">Aucune</p>}
        <ul className="space-y-2 text-sm">
          {patient.prescriptions.map((p) => (
            <li key={p.id} className="border-t border-slate-100 pt-2 first:border-0 first:pt-0">
              <p className="font-medium">{new Date(p.datePrescription).toLocaleDateString("fr-FR")}</p>
              <p>{p.posologie} — {p.duree}</p>
              {p.instructions && <p className="text-slate-500">{p.instructions}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ListeCertificats({
  certificats,
  type,
  labels,
}: {
  certificats: {
    id: string;
    conclusion: string;
    dateCertificat: Date;
    lieu: string;
    pdfGenereLe: Date | null;
    medecin: { nom: string; prenom: string; grade: string };
  }[];
  type: "ENGAGEMENT" | "SUIVI";
  labels: Record<string, string>;
}) {
  if (certificats.length === 0) {
    return <p className="text-sm text-slate-400">Aucun certificat</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {certificats.map((c) => (
        <li key={c.id} className="flex items-center justify-between border-t border-slate-100 pt-2 first:border-0 first:pt-0">
          <div>
            <p className="font-medium">{labels[c.conclusion] ?? c.conclusion}</p>
            <p className="text-slate-500">
              {new Date(c.dateCertificat).toLocaleDateString("fr-FR")} à {c.lieu} — {c.medecin.grade}{" "}
              {c.medecin.prenom} {c.medecin.nom}
            </p>
          </div>
          {c.pdfGenereLe && (
            <a
              href={`/api/certificats/${c.id}/pdf?type=${type}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-3 py-1 text-emerald-700 hover:bg-slate-50"
            >
              Voir le PDF
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
