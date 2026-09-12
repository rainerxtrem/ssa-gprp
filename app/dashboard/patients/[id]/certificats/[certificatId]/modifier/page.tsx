import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutSignerCertificatAptitude } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import NouveauCertificatClient from "../../nouveau/NouveauCertificatClient";
import type { CertificatAptitudeData, CertificatType } from "@/components/certificats/CertificatAptitudeForm";

export default async function ModifierCertificatPage({
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
  if (!peutSignerCertificatAptitude(session!.user.role)) {
    redirect(`/dashboard/patients/${id}/certificats/${certificatId}?type=${type}`);
  }

  const certificat =
    type === "ENGAGEMENT"
      ? await prisma.certificatEngagement.findUnique({
          where: { id: certificatId },
          include: { patient: { select: { grade: true, specialite: true } } },
        })
      : await prisma.certificatSuiviAptitudes.findUnique({
          where: { id: certificatId },
          include: { patient: { select: { grade: true, specialite: true } } },
        });

  if (!certificat || certificat.patientId !== id) notFound();
  if (certificat.annuleLe) {
    redirect(`/dashboard/patients/${id}/certificats/${certificatId}?type=${type}`);
  }

  const donneesInitiales: CertificatAptitudeData = {
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
    medecinNomComplet: session!.user.name ?? "",
    medecinGrade: session!.user.grade,
  };

  return (
    <div>
      <PageHeader
        title={type === "ENGAGEMENT" ? "Modifier le certificat d'engagement" : "Modifier le certificat de suivi"}
        backHref={`/dashboard/patients/${id}/certificats/${certificatId}?type=${type}`}
        backLabel="Retour au détail"
      />
      <NouveauCertificatClient
        type={type}
        patientId={id}
        mode="modifier"
        certificatId={certificatId}
        donneesInitiales={donneesInitiales}
      />
    </div>
  );
}
