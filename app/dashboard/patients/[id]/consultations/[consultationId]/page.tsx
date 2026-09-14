import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Activity, Paperclip, Pencil, Stethoscope } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical, peutLireDossierMedical, peutSupprimerDefinitivement } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatDateHeureFr } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PrintButton } from "@/components/ui/PrintButton";
import { AnnulerAction } from "@/components/ui/AnnulerAction";
import { SupprimerDefinitivementAction } from "@/components/ui/SupprimerDefinitivementAction";
import { Badge } from "@/components/ui/Badge";
import { PieceJointeUploader } from "@/components/patients/PieceJointeUploader";
import { bouton } from "@/lib/ui";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string; consultationId: string }>;
}) {
  const { id, consultationId } = await params;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;

  if (!peutLireDossierMedical(role)) notFound();

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      medecin: { select: { nom: true, prenom: true, grade: true } },
      patient: true,
      piecesJointes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, nomFichier: true, typeMime: true, taille: true, createdAt: true },
      },
    },
  });
  if (!consultation || consultation.patientId !== id) notFound();

  const peutEditer = peutEcrireDossierMedical(role) && !consultation.annuleLe;

  const constantes: { label: string; valeur: string }[] = [];
  if (consultation.temperature) constantes.push({ label: "Température", valeur: `${consultation.temperature} °C` });
  if (consultation.tensionSystolique && consultation.tensionDiastolique)
    constantes.push({ label: "Tension artérielle", valeur: `${consultation.tensionSystolique}/${consultation.tensionDiastolique} mmHg` });
  if (consultation.frequenceCardiaque) constantes.push({ label: "Fréquence cardiaque", valeur: `${consultation.frequenceCardiaque} bpm` });
  if (consultation.saturationO2) constantes.push({ label: "Saturation O2", valeur: `${consultation.saturationO2} %` });
  if (consultation.poids) constantes.push({ label: "Poids", valeur: `${consultation.poids} kg` });
  if (consultation.taille) constantes.push({ label: "Taille", valeur: `${consultation.taille} cm` });

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Consultation"
        description={formatDateHeureFr(consultation.dateConsultation)}
        backHref={`/dashboard/patients/${id}?onglet=suivi`}
        backLabel="Retour au dossier"
        action={
          <>
            {peutEditer && (
              <Link href={`/dashboard/patients/${id}/consultations/${consultation.id}/modifier`} className={bouton("secondaire")}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            )}
            <PrintButton />
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>
          {consultation.patient.grade} {consultation.patient.nom} {consultation.patient.prenom} — reçu(e) par{" "}
          {consultation.medecin.grade} {consultation.medecin.prenom} {consultation.medecin.nom}
        </span>
        {consultation.annuleLe && <Badge couleur="red">Annulée</Badge>}
      </div>

      {consultation.annuleLe && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          <p className="font-medium">Consultation annulée le {formatDateHeureFr(consultation.annuleLe)}</p>
          {consultation.annuleMotif && <p className="mt-0.5">{consultation.annuleMotif}</p>}
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader title="Motif et anamnèse" icon={<Stethoscope className="h-4 w-4" />} />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-500">Motif</p>
              <p className="text-slate-900">{consultation.motif}</p>
            </div>
            {consultation.anamnese && (
              <div>
                <p className="font-medium text-slate-500">Anamnèse</p>
                <p className="whitespace-pre-wrap text-slate-900">{consultation.anamnese}</p>
              </div>
            )}
            {consultation.examenClinique && (
              <div>
                <p className="font-medium text-slate-500">Examen clinique</p>
                <p className="whitespace-pre-wrap text-slate-900">{consultation.examenClinique}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {constantes.length > 0 && (
          <Card>
            <CardHeader title="Constantes" icon={<Activity className="h-4 w-4" />} />
            <CardBody>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {constantes.map((c) => (
                  <div key={c.label}>
                    <dt className="text-slate-500">{c.label}</dt>
                    <dd className="font-medium text-slate-900">{c.valeur}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader title="Pièces jointes" icon={<Paperclip className="h-4 w-4" />} />
          <CardBody>
            <PieceJointeUploader
              consultationId={consultation.id}
              pieces={consultation.piecesJointes.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
              peutModifier={peutEditer}
            />
          </CardBody>
        </Card>

        {(consultation.diagnostic || consultation.conduiteATenir) && (
          <Card>
            <CardHeader title="Conclusion" />
            <CardBody className="space-y-3 text-sm">
              {consultation.diagnostic && (
                <div>
                  <p className="font-medium text-slate-500">Diagnostic</p>
                  <p className="whitespace-pre-wrap text-slate-900">{consultation.diagnostic}</p>
                </div>
              )}
              {consultation.conduiteATenir && (
                <div>
                  <p className="font-medium text-slate-500">Conduite à tenir</p>
                  <p className="whitespace-pre-wrap text-slate-900">{consultation.conduiteATenir}</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {(peutEditer || peutSupprimerDefinitivement(role)) && (
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          {peutEditer && (
            <AnnulerAction
              endpoint={`/api/consultations/${consultation.id}/annuler`}
              confirmationLabel="Annuler cette consultation"
            />
          )}
          {peutSupprimerDefinitivement(role) && (
            <SupprimerDefinitivementAction
              endpoint={`/api/consultations/${consultation.id}`}
              redirectionApres={`/dashboard/patients/${id}?onglet=suivi`}
            />
          )}
        </div>
      )}
    </div>
  );
}
