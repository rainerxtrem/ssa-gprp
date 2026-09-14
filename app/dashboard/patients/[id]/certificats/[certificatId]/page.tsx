import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { History, Pencil } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutLireDossierMedical, peutSignerCertificatAptitude, peutSupprimerDefinitivement } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { obtenirHistoriqueDocument } from "@/lib/patients";
import { LIBELLES_ACTION_AUDIT, type ActionAudit } from "@/lib/audit";
import { formatDateHeureFr } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";
import { AnnulerAction } from "@/components/ui/AnnulerAction";
import { SupprimerDefinitivementAction } from "@/components/ui/SupprimerDefinitivementAction";
import { Badge } from "@/components/ui/Badge";
import CertificatAptitudeForm, {
  type CertificatAptitudeData,
  type CertificatType,
} from "@/components/certificats/CertificatAptitudeForm";

export default async function CertificatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; certificatId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id, certificatId } = await params;
  const { type: typeParam } = await searchParams;
  const type: CertificatType = typeParam === "ENGAGEMENT" ? "ENGAGEMENT" : "SUIVI";

  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  if (!peutLireDossierMedical(role)) notFound();

  const certificat =
    type === "ENGAGEMENT"
      ? await prisma.certificatEngagement.findUnique({
          where: { id: certificatId },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } }, patient: { select: { grade: true, specialite: true } } },
        })
      : await prisma.certificatSuiviAptitudes.findUnique({
          where: { id: certificatId },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } }, patient: { select: { grade: true, specialite: true } } },
        });

  if (!certificat || certificat.patientId !== id) notFound();

  const peutEditer = peutSignerCertificatAptitude(role) && !certificat.annuleLe;
  const historique = await obtenirHistoriqueDocument(certificatId);

  const data: CertificatAptitudeData = {
    nom: certificat.nom,
    prenom: certificat.prenom,
    ddn: certificat.ddn.toISOString(),
    rio: certificat.rio,
    grade: certificat.patient.grade,
    specialite: certificat.patient.specialite,
    s: certificat.s,
    i: certificat.i,
    g: certificat.g,
    y: certificat.y,
    c: certificat.c,
    o: certificat.o,
    p: certificat.p,
    aptitudeGeneraleSPP: certificat.aptitudeGeneraleSPP,
    aptitudeInitialeGES: certificat.aptitudeInitialeGES,
    aptitudeMIR: certificat.aptitudeMIR,
    aptitudeGRIMP: certificat.aptitudeGRIMP,
    aptitudeNRBCe: certificat.aptitudeNRBCe,
    aptitudeGHSC: certificat.aptitudeGHSC,
    conduiteGroupeLeger: certificat.conduiteGroupeLeger,
    conduiteGroupeLourd: certificat.conduiteGroupeLourd,
    opex: certificat.opex,
    contreIndicationEPMS: certificat.contreIndicationEPMS,
    observations: certificat.observations,
    conclusion: certificat.conclusion,
    lieu: certificat.lieu,
    dateCertificat: certificat.dateCertificat.toISOString(),
    medecinNomComplet: `${certificat.medecin.prenom} ${certificat.medecin.nom}`,
    medecinGrade: certificat.medecin.grade,
  };

  return (
    <div>
      <PageHeader
        title={type === "ENGAGEMENT" ? "Certificat d'engagement" : "Certificat de suivi des aptitudes"}
        backHref={`/dashboard/patients/${id}?onglet=aptitudes`}
        backLabel="Retour au dossier"
        action={
          <>
            {peutEditer && (
              <Link href={`/dashboard/patients/${id}/certificats/${certificat.id}/modifier?type=${type}`} className={bouton("secondaire")}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            )}
            {certificat.pdfGenereLe && (
              <a
                href={`/api/certificats/${certificat.id}/pdf?type=${type}`}
                target="_blank"
                rel="noreferrer"
                className={bouton("secondaire")}
              >
                Voir le PDF
              </a>
            )}
          </>
        }
      />

      {certificat.annuleLe && (
        <div className="mb-4 flex items-center gap-2 print:hidden">
          <Badge couleur="red">Annulé</Badge>
          {certificat.annuleMotif && <span className="text-sm text-slate-500">{certificat.annuleMotif}</span>}
        </div>
      )}

      <CertificatAptitudeForm type={type} data={data} editable={false} />

      {historique.length > 0 && (
        <div className="mx-auto mt-4 max-w-3xl print:hidden">
          <Card>
            <CardHeader title="Historique des versions" icon={<History className="h-4 w-4" />} />
            <CardBody>
              <ul className="divide-y divide-slate-100">
                {historique.map((entree) => {
                  const avant = entree.donneesAvant as Record<string, unknown> | null;
                  return (
                    <li key={entree.id} className="py-3 text-sm first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">
                          {LIBELLES_ACTION_AUDIT[entree.action as ActionAudit] ?? entree.action}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateHeureFr(entree.createdAt)}</span>
                      </div>
                      <p className="text-slate-500">
                        {entree.utilisateur.grade} {entree.utilisateur.prenom} {entree.utilisateur.nom}
                      </p>
                      {avant && (
                        <p className="mt-1 rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                          Avant : SIGYCOP {String(avant.s)}{String(avant.i)}{String(avant.g)}{String(avant.y)}
                          {String(avant.c)}{String(avant.o)}{String(avant.p)} — {String(avant.conclusion)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>
      )}

      {(peutEditer || peutSupprimerDefinitivement(role)) && (
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap gap-2 print:hidden">
          {peutEditer && (
            <AnnulerAction
              endpoint={`/api/certificats/${certificat.id}/annuler`}
              corpsSupplementaire={{ type }}
              confirmationLabel="Annuler ce certificat"
            />
          )}
          {peutSupprimerDefinitivement(role) && (
            <SupprimerDefinitivementAction
              endpoint={`/api/certificats/${certificat.id}`}
              corpsSupplementaire={{ type }}
              redirectionApres={`/dashboard/patients/${id}?onglet=aptitudes`}
            />
          )}
        </div>
      )}
    </div>
  );
}
