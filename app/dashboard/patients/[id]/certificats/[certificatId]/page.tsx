import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Pencil } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutLireDossierMedical, peutSignerCertificatAptitude } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { bouton } from "@/lib/ui";
import { AnnulerAction } from "@/components/ui/AnnulerAction";
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

      {peutEditer && (
        <div className="mx-auto mt-4 max-w-3xl print:hidden">
          <AnnulerAction
            endpoint={`/api/certificats/${certificat.id}/annuler`}
            corpsSupplementaire={{ type }}
            confirmationLabel="Annuler ce certificat"
          />
        </div>
      )}
    </div>
  );
}
