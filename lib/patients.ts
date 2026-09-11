import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { construireSyntheseCommandement, isCommandement, type SyntheseCommandement } from "@/lib/auth-guards";

export interface PatientListeItem {
  id: string;
  rio: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
}

/** Liste des patients pour un utilisateur médical/paramédical (accès complet). */
export async function listerPatientsDossierComplet(): Promise<PatientListeItem[]> {
  return prisma.patient.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    select: { id: true, rio: true, nom: true, prenom: true, grade: true, unite: true },
  });
}

/**
 * Liste des synthèses pour le COMMANDEMENT : ne sélectionne QUE les colonnes non sensibles
 * en base (jamais de SIGYCOP, diagnostic, motif ou ordonnance), conformément au secret médical.
 */
export async function listerSynthesesCommandement(): Promise<SyntheseCommandement[]> {
  const patients = await prisma.patient.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    select: {
      id: true,
      nom: true,
      prenom: true,
      grade: true,
      unite: true,
      profilsSigycop: {
        orderBy: { dateEvaluation: "desc" },
        take: 1,
        select: { dateEvaluation: true },
      },
      certificatsSuivi: {
        orderBy: { dateCertificat: "desc" },
        take: 1,
        select: { conclusion: true },
      },
      arretsTravail: {
        where: { transmisCommandement: true },
        orderBy: { dateDebut: "desc" },
        select: { dateDebut: true, dateFin: true, typeExemption: true },
      },
    },
  });

  return patients.map((patient) =>
    construireSyntheseCommandement({
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      grade: patient.grade,
      unite: patient.unite,
      derniereEvaluationSigycop: patient.profilsSigycop[0]?.dateEvaluation ?? null,
      visitePlanifieeLe: null,
      dernierConclusionSuivi: patient.certificatsSuivi[0]?.conclusion ?? null,
      arretsTransmis: patient.arretsTravail,
    })
  );
}

/** Point d'entrée unique : renvoie la vue de liste adaptée au rôle de l'utilisateur connecté. */
export async function listerPatientsPourRole(
  role: Role
): Promise<{ mode: "complet"; patients: PatientListeItem[] } | { mode: "commandement"; syntheses: SyntheseCommandement[] }> {
  if (isCommandement(role)) {
    return { mode: "commandement", syntheses: await listerSynthesesCommandement() };
  }
  return { mode: "complet", patients: await listerPatientsDossierComplet() };
}

/** Synthèse (secret médical strict) d'un seul patient, pour la fiche COMMANDEMENT. */
export async function obtenirSyntheseCommandementPatient(
  patientId: string
): Promise<SyntheseCommandement | null> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      grade: true,
      unite: true,
      profilsSigycop: {
        orderBy: { dateEvaluation: "desc" },
        take: 1,
        select: { dateEvaluation: true },
      },
      certificatsSuivi: {
        orderBy: { dateCertificat: "desc" },
        take: 1,
        select: { conclusion: true },
      },
      arretsTravail: {
        where: { transmisCommandement: true },
        orderBy: { dateDebut: "desc" },
        select: { dateDebut: true, dateFin: true, typeExemption: true },
      },
    },
  });

  if (!patient) return null;

  return construireSyntheseCommandement({
    id: patient.id,
    nom: patient.nom,
    prenom: patient.prenom,
    grade: patient.grade,
    unite: patient.unite,
    derniereEvaluationSigycop: patient.profilsSigycop[0]?.dateEvaluation ?? null,
    visitePlanifieeLe: null,
    dernierConclusionSuivi: patient.certificatsSuivi[0]?.conclusion ?? null,
    arretsTransmis: patient.arretsTravail,
  });
}

/** Dossier médical complet d'un patient (médicaux + paramédicaux uniquement). */
export async function obtenirDossierCompletPatient(patientId: string) {
  return prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      profilsSigycop: { orderBy: { dateEvaluation: "desc" } },
      certificatsSuivi: {
        orderBy: { dateCertificat: "desc" },
        select: {
          id: true,
          conclusion: true,
          dateCertificat: true,
          lieu: true,
          pdfGenereLe: true,
          medecin: { select: { nom: true, prenom: true, grade: true } },
        },
      },
      certificatsEngagement: {
        orderBy: { dateCertificat: "desc" },
        select: {
          id: true,
          conclusion: true,
          dateCertificat: true,
          lieu: true,
          pdfGenereLe: true,
          medecin: { select: { nom: true, prenom: true, grade: true } },
        },
      },
      arretsTravail: { orderBy: { dateDebut: "desc" } },
      prescriptions: { orderBy: { datePrescription: "desc" } },
    },
  });
}
