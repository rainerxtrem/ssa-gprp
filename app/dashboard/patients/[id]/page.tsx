import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  Download,
  FileCheck2,
  FilePlus2,
  History,
  Pencil,
  Pill,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  isCommandement,
  peutEcrireDossierMedical,
  peutGenererConvocation,
  peutLireDossierMedical,
  peutPrescrire,
  peutSignerCertificatAptitude,
} from "@/lib/auth-guards";
import { obtenirDossierCompletPatient, obtenirSyntheseCommandementPatient } from "@/lib/patients";
import { CONCLUSION_ENGAGEMENT_LABELS, CONCLUSION_SUIVI_LABELS } from "@/lib/sigycop";
import { TYPE_EXEMPTION_LABELS } from "@/lib/arrets";
import { STATUT_CONVOCATION_LABELS } from "@/lib/convocations";
import { LIBELLES_ACTION_AUDIT, type ActionAudit } from "@/lib/audit";
import { calculerAge, formatDateFr, formatDateHeureFr, initiales } from "@/lib/format";
import { bouton } from "@/lib/ui";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, badgeCouleurStatutAptitude, badgeCouleurStatutVisite } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordCard } from "@/components/ui/RecordCard";
import { Tabs } from "@/components/ui/Tabs";
import { StatutConvocationSelect } from "@/components/patients/StatutConvocationSelect";

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const { onglet } = await searchParams;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  if (isCommandement(role)) {
    const synthese = await obtenirSyntheseCommandementPatient(id);
    if (!synthese) notFound();

    return (
      <div className="max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-800">
            {initiales(synthese.nom, synthese.prenom)}
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {synthese.grade} {synthese.nom} {synthese.prenom}
            </h1>
            <p className="text-sm text-slate-500">{synthese.unite}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">Statut de visite</p>
              <div className="mt-2">
                <Badge couleur={badgeCouleurStatutVisite(synthese.statutVisite)}>{synthese.statutVisite}</Badge>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">Statut d&apos;aptitude</p>
              <div className="mt-2">
                <Badge couleur={badgeCouleurStatutAptitude(synthese.statutAptitude)}>{synthese.statutAptitude}</Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader title="Arrêts / exemptions transmis" />
          <CardBody className="space-y-3">
            {synthese.arrets.length === 0 ? (
              <EmptyState title="Aucun arrêt transmis" />
            ) : (
              synthese.arrets.map((a, idx) => (
                <RecordCard
                  key={idx}
                  title={TYPE_EXEMPTION_LABELS[a.typeExemption] ?? a.typeExemption}
                  lines={[`Du ${a.dateDebut} au ${a.dateFin}`]}
                />
              ))
            )}
          </CardBody>
        </Card>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Secret médical strict : aucun diagnostic, constante ou ordonnance n&apos;est accessible à ce niveau.</p>
        </div>
      </div>
    );
  }

  const patient = await obtenirDossierCompletPatient(id);
  if (!patient) notFound();

  const peutEditer = peutEcrireDossierMedical(role);
  const peutCertifier = peutSignerCertificatAptitude(role);
  const peutOrdonner = peutPrescrire(role);
  const peutConvoquer = peutGenererConvocation(role);

  return (
    <div>
      {/* En-tête du dossier */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-800">
            {initiales(patient.nom, patient.prenom)}
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {patient.grade} {patient.nom} {patient.prenom}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>{patient.unite}</span>
              <span>·</span>
              <span>{patient.specialite || "Sans spécialité"}</span>
              <span>·</span>
              <span>{calculerAge(patient.ddn)} ans</span>
              <span>·</span>
              <span>RIO {patient.rio}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/patients/${patient.id}/dossier-pdf`} target="_blank" rel="noreferrer" className={bouton("secondaire")}>
            <Download className="h-4 w-4" />
            Exporter le dossier
          </a>
          {peutEditer && (
            <Link href={`/dashboard/patients/${patient.id}/modifier`} className={bouton("secondaire")}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          )}
        </div>
      </div>

      <Tabs
        defaultTab={onglet === "suivi" ? "suivi" : onglet === "historique" ? "historique" : "aptitudes"}
        tabs={[
          {
            key: "aptitudes",
            label: "Aptitudes",
            icon: <FileCheck2 className="h-4 w-4" />,
            content: (
              <div className="space-y-6">
                <Card>
                  <CardHeader title="Historique SIGYCOP" icon={<Activity className="h-4 w-4" />} />
                  <CardBody>
                    {patient.profilsSigycop.length === 0 ? (
                      <EmptyState title="Aucune évaluation SIGYCOP enregistrée" />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="pb-2 pr-4 font-medium">Date</th>
                              {["S", "I", "G", "Y", "C", "O", "P"].map((l) => (
                                <th key={l} className="pb-2 pr-4 font-medium">{l}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {patient.profilsSigycop.map((p) => (
                              <tr key={p.id}>
                                <td className="py-2 pr-4 text-slate-600">{formatDateFr(p.dateEvaluation)}</td>
                                <td className="py-2 pr-4">{p.s}</td>
                                <td className="py-2 pr-4">{p.i}</td>
                                <td className="py-2 pr-4">{p.g}</td>
                                <td className="py-2 pr-4">{p.y}</td>
                                <td className="py-2 pr-4">{p.c}</td>
                                <td className="py-2 pr-4">{p.o}</td>
                                <td className="py-2 pr-4">{p.p}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Certificats de suivi des aptitudes"
                    icon={<FileCheck2 className="h-4 w-4" />}
                    action={
                      peutCertifier && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/certificats/nouveau?type=SUIVI`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouveau
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    <ListeCertificats
                      certificats={patient.certificatsSuivi}
                      type="SUIVI"
                      labels={CONCLUSION_SUIVI_LABELS}
                      patientId={patient.id}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Certificats d'engagement"
                    icon={<FileCheck2 className="h-4 w-4" />}
                    action={
                      peutCertifier && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/certificats/nouveau?type=ENGAGEMENT`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouveau
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    <ListeCertificats
                      certificats={patient.certificatsEngagement}
                      type="ENGAGEMENT"
                      labels={CONCLUSION_ENGAGEMENT_LABELS}
                      patientId={patient.id}
                    />
                  </CardBody>
                </Card>
              </div>
            ),
          },
          {
            key: "suivi",
            label: "Suivi médical",
            icon: <Stethoscope className="h-4 w-4" />,
            content: (
              <div className="space-y-6">
                <Card>
                  <CardHeader
                    title="Consultations"
                    icon={<Stethoscope className="h-4 w-4" />}
                    action={
                      peutEditer && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/consultations/nouveau`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouvelle
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    {patient.consultations.length === 0 ? (
                      <EmptyState title="Aucune consultation enregistrée" />
                    ) : (
                      patient.consultations.map((c) => (
                        <RecordCard
                          key={c.id}
                          title={`Consultation du ${formatDateFr(c.dateConsultation)}`}
                          lines={[
                            `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
                            `Diagnostic : ${c.diagnostic || "non renseigné"}`,
                          ]}
                          badges={c.annuleLe && <Badge couleur="red">Annulée</Badge>}
                          action={
                            <Link
                              href={`/dashboard/patients/${patient.id}/consultations/${c.id}`}
                              className={bouton("secondaire", "sm")}
                            >
                              Voir plus de détails
                            </Link>
                          }
                        />
                      ))
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Ordonnances"
                    icon={<Pill className="h-4 w-4" />}
                    action={
                      peutOrdonner && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/ordonnances/nouveau`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouvelle
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    {patient.prescriptions.length === 0 ? (
                      <EmptyState title="Aucune ordonnance enregistrée" />
                    ) : (
                      patient.prescriptions.map((p) => {
                        const lignes = Array.isArray(p.medicaments)
                          ? (p.medicaments as { nom: string }[])
                          : [];
                        return (
                          <RecordCard
                            key={p.id}
                            title={`Ordonnance du ${formatDateFr(p.datePrescription)}`}
                            lines={[
                              `${p.medecin.grade} ${p.medecin.prenom} ${p.medecin.nom}`,
                              lignes.map((m) => m.nom).join(", ") || "Aucun médicament",
                            ]}
                            badges={p.annuleLe && <Badge couleur="red">Annulée</Badge>}
                            action={
                              <>
                                <Link
                                  href={`/dashboard/patients/${patient.id}/ordonnances/${p.id}`}
                                  className={bouton("secondaire", "sm")}
                                >
                                  Voir plus de détails
                                </Link>
                                {p.pdfGenereLe && (
                                  <a
                                    href={`/api/prescriptions/${p.id}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={bouton("discret", "sm")}
                                  >
                                    PDF
                                  </a>
                                )}
                              </>
                            }
                          />
                        );
                      })
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Convocations"
                    icon={<CalendarClock className="h-4 w-4" />}
                    action={
                      peutConvoquer && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/convocations/nouveau`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouvelle
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    {patient.convocations.length === 0 ? (
                      <EmptyState title="Aucune convocation enregistrée" />
                    ) : (
                      patient.convocations.map((c) => (
                        <RecordCard
                          key={c.id}
                          title={`Visite du ${formatDateFr(c.dateConvocation)}`}
                          lines={[
                            `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
                            c.motif,
                          ]}
                          action={
                            peutConvoquer ? (
                              <StatutConvocationSelect convocationId={c.id} statutActuel={c.statut} />
                            ) : (
                              <Badge couleur="slate">{STATUT_CONVOCATION_LABELS[c.statut] ?? c.statut}</Badge>
                            )
                          }
                        />
                      ))
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Arrêts de travail / exemptions"
                    icon={<ClipboardList className="h-4 w-4" />}
                    action={
                      peutEditer && (
                        <Link
                          href={`/dashboard/patients/${patient.id}/arrets/nouveau`}
                          className={bouton("secondaire", "sm")}
                        >
                          <FilePlus2 className="h-4 w-4" />
                          Nouveau
                        </Link>
                      )
                    }
                  />
                  <CardBody className="space-y-3">
                    {patient.arretsTravail.length === 0 ? (
                      <EmptyState title="Aucun arrêt enregistré" />
                    ) : (
                      patient.arretsTravail.map((a) => (
                        <RecordCard
                          key={a.id}
                          title={TYPE_EXEMPTION_LABELS[a.typeExemption] ?? a.typeExemption}
                          lines={[
                            `Du ${formatDateFr(a.dateDebut)} au ${formatDateFr(a.dateFin)}`,
                            a.motif,
                          ]}
                          badges={
                            <Badge couleur={a.transmisCommandement ? "emerald" : "slate"}>
                              {a.transmisCommandement ? "Transmis au commandement" : "Non transmis"}
                            </Badge>
                          }
                        />
                      ))
                    )}
                  </CardBody>
                </Card>
              </div>
            ),
          },
          {
            key: "historique",
            label: "Historique",
            icon: <History className="h-4 w-4" />,
            content: (
              <Card>
                <CardHeader title="Journal des modifications" description="Qui a créé, modifié ou annulé quoi, et quand." />
                <CardBody>
                  {patient.journalEntries.length === 0 ? (
                    <EmptyState title="Aucune entrée dans l'historique" />
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {patient.journalEntries.map((entree) => (
                        <li key={entree.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <div>
                            <p className="font-medium text-slate-900">
                              {LIBELLES_ACTION_AUDIT[entree.action as ActionAudit] ?? entree.action}
                            </p>
                            <p className="text-sm text-slate-500">
                              {entree.utilisateur.grade} {entree.utilisateur.prenom} {entree.utilisateur.nom}
                            </p>
                            {entree.details && <p className="mt-0.5 text-sm text-slate-400">{entree.details}</p>}
                          </div>
                          <span className="whitespace-nowrap text-xs text-slate-400">
                            {formatDateHeureFr(entree.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

function ListeCertificats({
  certificats,
  type,
  labels,
  patientId,
}: {
  certificats: {
    id: string;
    conclusion: string;
    dateCertificat: Date;
    lieu: string;
    pdfGenereLe: Date | null;
    annuleLe: Date | null;
    medecin: { nom: string; prenom: string; grade: string };
  }[];
  type: "ENGAGEMENT" | "SUIVI";
  labels: Record<string, string>;
  patientId: string;
}) {
  if (certificats.length === 0) {
    return <EmptyState title="Aucun certificat" />;
  }

  return (
    <>
      {certificats.map((c) => (
        <RecordCard
          key={c.id}
          title={labels[c.conclusion] ?? c.conclusion}
          lines={[
            `${formatDateFr(c.dateCertificat)} à ${c.lieu}`,
            `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
          ]}
          badges={c.annuleLe && <Badge couleur="red">Annulé</Badge>}
          action={
            <>
              <Link
                href={`/dashboard/patients/${patientId}/certificats/${c.id}?type=${type}`}
                className={bouton("secondaire", "sm")}
              >
                Voir plus de détails
              </Link>
              {c.pdfGenereLe && (
                <a
                  href={`/api/certificats/${c.id}/pdf?type=${type}`}
                  target="_blank"
                  rel="noreferrer"
                  className={bouton("discret", "sm")}
                >
                  PDF
                </a>
              )}
            </>
          }
        />
      ))}
    </>
  );
}
