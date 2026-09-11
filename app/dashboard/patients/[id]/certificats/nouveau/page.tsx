import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutSignerCertificatAptitude } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import NouveauCertificatClient from "./NouveauCertificatClient";
import type { CertificatSuiviAptitudesData } from "@/components/CertificatSuiviAptitudes";

export default async function NouveauCertificatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutSignerCertificatAptitude(session!.user.role)) {
    redirect(`/dashboard/patients/${id}`);
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, nom: true, prenom: true, ddn: true, rio: true, grade: true, specialite: true },
  });
  if (!patient) notFound();

  const donneesInitiales: CertificatSuiviAptitudesData = {
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
    observations: "",
    conclusion: null,
    lieu: "",
    dateCertificat: new Date().toISOString(),
    medecinNomComplet: session!.user.name ?? "",
    medecinGrade: session!.user.grade,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold print:hidden">Nouveau certificat de suivi des aptitudes</h1>
      <NouveauCertificatClient patientId={patient.id} donneesInitiales={donneesInitiales} />
    </div>
  );
}
