import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Pencil, Pill, RefreshCcw } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutLireDossierMedical, peutPrescrire, peutSupprimerDefinitivement } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatDateFr } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PrintButton } from "@/components/ui/PrintButton";
import { AnnulerAction } from "@/components/ui/AnnulerAction";
import { SupprimerDefinitivementAction } from "@/components/ui/SupprimerDefinitivementAction";
import { Badge } from "@/components/ui/Badge";
import { bouton } from "@/lib/ui";

export default async function OrdonnanceDetailPage({
  params,
}: {
  params: Promise<{ id: string; prescriptionId: string }>;
}) {
  const { id, prescriptionId } = await params;
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  if (!peutLireDossierMedical(role)) notFound();

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { medecin: { select: { nom: true, prenom: true, grade: true } }, patient: true },
  });
  if (!prescription || prescription.patientId !== id) notFound();

  const peutEditer = peutPrescrire(role) && !prescription.annuleLe;

  const lignes = Array.isArray(prescription.medicaments)
    ? (prescription.medicaments as { nom: string; dosage?: string; forme?: string; posologie: string; duree: string }[])
    : [];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Ordonnance"
        description={formatDateFr(prescription.datePrescription)}
        backHref={`/dashboard/patients/${id}?onglet=suivi`}
        backLabel="Retour au dossier"
        action={
          <>
            {peutPrescrire(role) && (
              <Link
                href={`/dashboard/patients/${id}/ordonnances/nouveau?dupliquer=${prescription.id}`}
                className={bouton("secondaire")}
              >
                <RefreshCcw className="h-4 w-4" />
                Renouveler
              </Link>
            )}
            {peutEditer && (
              <Link href={`/dashboard/patients/${id}/ordonnances/${prescription.id}/modifier`} className={bouton("secondaire")}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            )}
            {prescription.pdfGenereLe && (
              <a
                href={`/api/prescriptions/${prescription.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className={bouton("secondaire")}
              >
                Voir le PDF
              </a>
            )}
            <PrintButton />
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>
          {prescription.patient.grade} {prescription.patient.nom} {prescription.patient.prenom} — prescrit par{" "}
          {prescription.medecin.grade} {prescription.medecin.prenom} {prescription.medecin.nom}
          {prescription.lieu && ` à ${prescription.lieu}`}
        </span>
        {prescription.annuleLe && <Badge couleur="red">Annulée</Badge>}
      </div>

      {prescription.annuleLe && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          <p className="font-medium">Ordonnance annulée</p>
          {prescription.annuleMotif && <p className="mt-0.5">{prescription.annuleMotif}</p>}
        </div>
      )}

      <Card>
        <CardHeader title="Médicaments" icon={<Pill className="h-4 w-4" />} />
        <CardBody>
          <ul className="divide-y divide-slate-100">
            {lignes.map((m, idx) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0">
                <p className="font-medium text-slate-900">
                  {m.nom}
                  {m.dosage ? ` — ${m.dosage}` : ""}
                  {m.forme ? ` (${m.forme})` : ""}
                </p>
                <p className="text-sm text-slate-500">Posologie : {m.posologie}</p>
                <p className="text-sm text-slate-500">Durée : {m.duree}</p>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {prescription.instructions && (
        <Card className="mt-4">
          <CardHeader title="Instructions complémentaires" />
          <CardBody>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{prescription.instructions}</p>
          </CardBody>
        </Card>
      )}

      {(peutEditer || peutSupprimerDefinitivement(role)) && (
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          {peutEditer && (
            <AnnulerAction endpoint={`/api/prescriptions/${prescription.id}/annuler`} confirmationLabel="Annuler cette ordonnance" />
          )}
          {peutSupprimerDefinitivement(role) && (
            <SupprimerDefinitivementAction
              endpoint={`/api/prescriptions/${prescription.id}`}
              redirectionApres={`/dashboard/patients/${id}?onglet=suivi`}
            />
          )}
        </div>
      )}
    </div>
  );
}
