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

const SELECT_CERTIFICAT_SUIVI_COMMANDEMENT = {
  orderBy: { dateCertificat: "desc" as const },
  where: { annuleLe: null },
  take: 1,
  select: { conclusion: true },
};

const SELECT_ARRETS_COMMANDEMENT = {
  where: { transmisCommandement: true },
  orderBy: { dateDebut: "desc" as const },
  select: { dateDebut: true, dateFin: true, typeExemption: true },
};

const SELECT_PROCHAINE_CONVOCATION = {
  where: { statut: "PLANIFIEE" as const, dateConvocation: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  orderBy: { dateConvocation: "asc" as const },
  take: 1,
  select: { dateConvocation: true },
};

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
      certificatsSuivi: SELECT_CERTIFICAT_SUIVI_COMMANDEMENT,
      arretsTravail: SELECT_ARRETS_COMMANDEMENT,
      convocations: SELECT_PROCHAINE_CONVOCATION,
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
      visitePlanifieeLe: patient.convocations[0]?.dateConvocation ?? null,
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
      certificatsSuivi: SELECT_CERTIFICAT_SUIVI_COMMANDEMENT,
      arretsTravail: SELECT_ARRETS_COMMANDEMENT,
      convocations: SELECT_PROCHAINE_CONVOCATION,
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
    visitePlanifieeLe: patient.convocations[0]?.dateConvocation ?? null,
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
          annuleLe: true,
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
          annuleLe: true,
          medecin: { select: { nom: true, prenom: true, grade: true } },
        },
      },
      arretsTravail: { orderBy: { dateDebut: "desc" } },
      consultations: {
        orderBy: { dateConsultation: "desc" },
        include: {
          medecin: { select: { nom: true, prenom: true, grade: true } },
          piecesJointes: {
            orderBy: { createdAt: "desc" },
            select: { id: true, nomFichier: true, typeMime: true, taille: true, createdAt: true },
          },
        },
      },
      prescriptions: {
        orderBy: { datePrescription: "desc" },
        select: {
          id: true,
          medicaments: true,
          instructions: true,
          lieu: true,
          datePrescription: true,
          pdfGenereLe: true,
          annuleLe: true,
          medecin: { select: { nom: true, prenom: true, grade: true } },
        },
      },
      convocations: {
        orderBy: { dateConvocation: "desc" },
        include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
      },
      journalEntries: {
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { utilisateur: { select: { nom: true, prenom: true, grade: true } } },
      },
      signalements: {
        orderBy: { createdAt: "desc" },
        include: {
          infirmier: { select: { nom: true, prenom: true, grade: true } },
          medecin: { select: { nom: true, prenom: true, grade: true } },
        },
      },
    },
  });
}

/**
 * File d'attente d'homologation pour un médecin : tous les signalements
 * d'inaptitude en attente, avec indication du médecin référent de l'unité
 * du patient (pour orienter sans jamais empêcher un autre médecin d'agir).
 */
export async function listerSignalementsEnAttente() {
  const [signalements, referents] = await Promise.all([
    prisma.signalementInaptitude.findMany({
      where: { statut: "EN_ATTENTE" },
      orderBy: { createdAt: "asc" },
      include: {
        patient: { select: { id: true, nom: true, prenom: true, grade: true, unite: true } },
        infirmier: { select: { nom: true, prenom: true, grade: true } },
      },
    }),
    prisma.uniteReferent.findMany({
      include: { medecin: { select: { id: true, nom: true, prenom: true, grade: true } } },
    }),
  ]);

  const referentParUnite = new Map(referents.map((r) => [r.unite, r.medecin]));

  return signalements.map((s) => ({
    ...s,
    referent: referentParUnite.get(s.patient.unite) ?? null,
  }));
}

/** Suivi infirmier autonome : patients qu'un paramédical donné a récemment suivis. */
export async function listerPatientsEnSuiviInfirmier(infirmierId: string) {
  const consultations = await prisma.consultation.findMany({
    where: { medecinId: infirmierId, type: "SUIVI_INFIRMIER", annuleLe: null },
    orderBy: { dateConsultation: "desc" },
    select: {
      dateConsultation: true,
      motif: true,
      patient: { select: { id: true, nom: true, prenom: true, grade: true, unite: true } },
    },
  });

  const parPatient = new Map<string, { patient: (typeof consultations)[number]["patient"]; derniereConsultation: Date; motif: string; nbConsultations: number }>();
  for (const c of consultations) {
    const existant = parPatient.get(c.patient.id);
    if (existant) {
      existant.nbConsultations += 1;
    } else {
      parPatient.set(c.patient.id, {
        patient: c.patient,
        derniereConsultation: c.dateConsultation,
        motif: c.motif,
        nbConsultations: 1,
      });
    }
  }

  return Array.from(parPatient.values()).sort(
    (a, b) => b.derniereConsultation.getTime() - a.derniereConsultation.getTime()
  );
}

/** Historique des versions d'un document précis (créations/modifications/annulations). */
export async function obtenirHistoriqueDocument(documentId: string) {
  return prisma.journalAudit.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    include: { utilisateur: { select: { nom: true, prenom: true, grade: true } } },
  });
}

/**
 * Recherche globale de patients (nom, prénom ou RIO). Le COMMANDEMENT ne
 * reçoit que les champs non sensibles — jamais de lien direct vers un
 * dossier médical détaillé au-delà de ce que ses pages exposent déjà.
 */
export async function rechercherPatients(requete: string): Promise<PatientListeItem[]> {
  const q = requete.trim();
  if (q.length < 2) return [];

  return prisma.patient.findMany({
    where: {
      OR: [
        { nom: { contains: q, mode: "insensitive" } },
        { prenom: { contains: q, mode: "insensitive" } },
        { rio: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: 10,
    select: { id: true, rio: true, nom: true, prenom: true, grade: true, unite: true },
  });
}
