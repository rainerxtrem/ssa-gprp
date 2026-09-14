import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutSignerCertificatAptitude } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import NouveauCertificatClient from "./NouveauCertificatClient";
import type { CertificatAptitudeData, CertificatType } from "@/components/certificats/CertificatAptitudeForm";

export default async function NouveauCertificatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; signalementId?: string }>;
}) {
  const { id } = await params;
  const { type: typeParam, signalementId } = await searchParams;
  const type: CertificatType = typeParam === "ENGAGEMENT" ? "ENGAGEMENT" : "SUIVI";

  const session = await getServerSession(authOptions);
  if (!peutSignerCertificatAptitude(session!.user.role)) {
    redirect(`/dashboard/patients/${id}`);
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, nom: true, prenom: true, ddn: true, rio: true, grade: true, specialite: true },
  });
  if (!patient) notFound();

  const signalement =
    signalementId && type === "SUIVI"
      ? await prisma.signalementInaptitude.findUnique({
          where: { id: signalementId },
          include: { infirmier: { select: { nom: true, prenom: true, grade: true } } },
        })
      : null;
  if (signalement && (signalement.patientId !== id || signalement.statut !== "EN_ATTENTE")) {
    notFound();
  }

  const donneesInitiales: CertificatAptitudeData = {
    nom: patient.nom,
    prenom: patient.prenom,
    ddn: patient.ddn.toISOString(),
    rio: patient.rio,
    grade: patient.grade,
    specialite: patient.specialite,
    s: 1,
    i: 1,
    g: 1,
    y: 1,
    c: 1,
    o: 1,
    p: 1,
    aptitudeGeneraleSPP: "NON_EVALUE",
    aptitudeInitialeGES: "NON_EVALUE",
    aptitudeMIR: "NON_EVALUE",
    aptitudeGRIMP: "NON_EVALUE",
    aptitudeNRBCe: "NON_EVALUE",
    aptitudeGHSC: "NON_EVALUE",
    conduiteGroupeLeger: "NON_EVALUE",
    conduiteGroupeLourd: "NON_EVALUE",
    opex: "NON_EVALUE",
    contreIndicationEPMS: false,
    observations: signalement
      ? `Homologation du signalement de ${signalement.infirmier.grade} ${signalement.infirmier.prenom} ${signalement.infirmier.nom} : ${signalement.motif}${signalement.observations ? `\n${signalement.observations}` : ""}`
      : "",
    conclusion: null,
    lieu: "",
    dateCertificat: new Date().toISOString(),
    medecinNomComplet: session!.user.name ?? "",
    medecinGrade: session!.user.grade,
  };

  return (
    <div>
      <PageHeader
        title={
          signalement
            ? "Homologuer le signalement d'inaptitude"
            : type === "ENGAGEMENT"
            ? "Nouveau certificat d'engagement"
            : "Nouveau certificat de suivi des aptitudes"
        }
        description={
          signalement
            ? `Déclaré par ${signalement.infirmier.grade} ${signalement.infirmier.prenom} ${signalement.infirmier.nom}`
            : undefined
        }
        backHref={signalement ? "/dashboard/signalements" : `/dashboard/patients/${id}?onglet=aptitudes`}
        backLabel={signalement ? "Retour aux signalements" : "Retour au dossier"}
      />
      <NouveauCertificatClient
        type={type}
        patientId={patient.id}
        donneesInitiales={donneesInitiales}
        signalementId={signalement?.id}
      />
    </div>
  );
}
