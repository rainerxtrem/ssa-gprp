import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { statutAptitudeGlobalePourCommandement } from "@/lib/sigycop";
import type { ConclusionSuivi } from "@prisma/client";

// ---------------------------------------------------------------------------
// Groupes de rôles
// ---------------------------------------------------------------------------

export const ROLES_MEDICAUX: Role[] = [
  Role.MEDECIN_CHEF,
  Role.MEDECIN_PRINCIPAL,
  Role.MEDECIN_ARMES,
  Role.INTERNE_MEDECINE,
  Role.EXTERNE_MEDECINE,
];

export const ROLES_PARAMEDICAUX: Role[] = [
  Role.CADRE_SANTE,
  Role.INFIRMIER_MAJOR,
  Role.INFIRMIER_ANESTHESISTE,
  Role.INFIRMIER,
  Role.ETUDIANT_INFIRMIER,
];

export const ROLES_COMMANDEMENT: Role[] = [Role.COMMANDEMENT];

export function isMedecin(role: Role): boolean {
  return ROLES_MEDICAUX.includes(role);
}

export function isParamedical(role: Role): boolean {
  return ROLES_PARAMEDICAUX.includes(role);
}

export function isCommandement(role: Role): boolean {
  return ROLES_COMMANDEMENT.includes(role);
}

// ---------------------------------------------------------------------------
// Matrice d'habilitation métier
// ---------------------------------------------------------------------------

/** Lecture/écriture complète du dossier médical (diagnostic, SIGYCOP, ordonnances, certificats). */
export function peutEcrireDossierMedical(role: Role): boolean {
  return isMedecin(role);
}

/** Lecture du dossier médical : médicaux + paramédicaux. Le COMMANDEMENT n'y a jamais accès. */
export function peutLireDossierMedical(role: Role): boolean {
  return isMedecin(role) || isParamedical(role);
}

/** Seuls les médicaux signent un certificat médical d'aptitude (engagement ou suivi). */
export function peutSignerCertificatAptitude(role: Role): boolean {
  return isMedecin(role);
}

/** Saisie des constantes et exécution des soins : médicaux + paramédicaux. */
export function peutSaisirConstantes(role: Role): boolean {
  return isMedecin(role) || isParamedical(role);
}

/** Génération des convocations aux visites médicales : médicaux + paramédicaux. */
export function peutGenererConvocation(role: Role): boolean {
  return isMedecin(role) || isParamedical(role);
}

/** Rédaction d'une prescription / ordonnance : réservé aux médicaux. */
export function peutPrescrire(role: Role): boolean {
  return isMedecin(role);
}

/** Décision de transmission d'un arrêt/exemption au commandement : réservé aux médicaux. */
export function peutTransmettreArretAuCommandement(role: Role): boolean {
  return isMedecin(role);
}

// ---------------------------------------------------------------------------
// Contrôle d'accès pour les Route Handlers
// ---------------------------------------------------------------------------

export class AccesRefuseError extends Error {
  status: number;
  constructor(message = "Accès refusé : privilèges insuffisants pour cette action.", status = 403) {
    super(message);
    this.name = "AccesRefuseError";
    this.status = status;
  }
}

export type SessionUtilisateur = { id: string; role: Role; email: string; grade: string };

/** Récupère la session serveur courante ou lève une erreur 401. À utiliser dans les Route Handlers. */
export async function getSessionUtilisateur(): Promise<SessionUtilisateur> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AccesRefuseError("Non authentifié.", 401);
  }
  return session.user as unknown as SessionUtilisateur;
}

/** Vérifie que le rôle de l'utilisateur figure dans la liste autorisée, sinon lève une erreur 403. */
export function requireRole(role: Role, rolesAutorises: Role[]): void {
  if (!rolesAutorises.includes(role)) {
    throw new AccesRefuseError();
  }
}

/**
 * Barrière absolue du secret médical : le COMMANDEMENT ne doit jamais recevoir
 * de diagnostic, constante, ordonnance ou motif médical, quelle que soit la route appelée.
 * À invoquer en tout premier dans toute route qui touche au dossier médical.
 */
export function interdireAccesDossierMedicalAuCommandement(role: Role): void {
  if (isCommandement(role)) {
    throw new AccesRefuseError("Secret médical : le COMMANDEMENT n'a pas accès au dossier médical.");
  }
}

/**
 * Enveloppe un Route Handler Next.js avec un contrôle de rôle et une gestion d'erreur uniforme.
 * Usage : export const POST = withRole(ROLES_MEDICAUX, async (utilisateur, request) => { ... });
 */
export function withRole<Args extends unknown[]>(
  rolesAutorises: Role[],
  handler: (utilisateur: SessionUtilisateur, ...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      const utilisateur = await getSessionUtilisateur();
      requireRole(utilisateur.role, rolesAutorises);
      return await handler(utilisateur, ...args);
    } catch (error) {
      if (error instanceof AccesRefuseError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error(error);
      return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
    }
  };
}

// ---------------------------------------------------------------------------
// Filtrage des données exposées au COMMANDEMENT
// ---------------------------------------------------------------------------

export type StatutVisite = "À jour" | "En retard" | string; // ou "Planifiée le DD/MM/YYYY"

export interface SyntheseCommandement {
  patientId: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  statutVisite: StatutVisite;
  statutAptitude: string;
  arrets: { dateDebut: string; dateFin: string; typeExemption: string }[];
}

const VALIDITE_VISITE_JOURS = 365;

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Construit la SEULE vue autorisée pour le COMMANDEMENT à partir des données brutes
 * du dossier médical. Aucune valeur clinique (SIGYCOP, diagnostic, motif, ordonnance)
 * ne doit jamais transiter par cette fonction ni figurer dans son type de retour.
 */
export function construireSyntheseCommandement(patient: {
  id: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  derniereEvaluationSigycop: Date | null;
  visitePlanifieeLe: Date | null;
  dernierConclusionSuivi: ConclusionSuivi | null;
  arretsTransmis: { dateDebut: Date; dateFin: Date; typeExemption: string }[];
}): SyntheseCommandement {
  let statutVisite: StatutVisite;
  if (patient.visitePlanifieeLe) {
    statutVisite = `Planifiée le ${formatDateFr(patient.visitePlanifieeLe)}`;
  } else if (
    patient.derniereEvaluationSigycop &&
    Date.now() - patient.derniereEvaluationSigycop.getTime() <= VALIDITE_VISITE_JOURS * 86_400_000
  ) {
    statutVisite = "À jour";
  } else {
    statutVisite = "En retard";
  }

  return {
    patientId: patient.id,
    nom: patient.nom,
    prenom: patient.prenom,
    grade: patient.grade,
    unite: patient.unite,
    statutVisite,
    statutAptitude: statutAptitudeGlobalePourCommandement(patient.dernierConclusionSuivi),
    arrets: patient.arretsTransmis.map((a) => ({
      dateDebut: formatDateFr(a.dateDebut),
      dateFin: formatDateFr(a.dateFin),
      typeExemption: a.typeExemption,
    })),
  };
}

/**
 * Sélection Prisma sûre pour ArretTravail exposé au COMMANDEMENT : exclut toujours `motif`
 * et ne renvoie que des arrêts explicitement marqués `transmisCommandement`.
 */
export const ARRET_TRAVAIL_SELECT_COMMANDEMENT = {
  id: true,
  dateDebut: true,
  dateFin: true,
  typeExemption: true,
  transmisCommandement: true,
} as const;

export const ARRET_TRAVAIL_WHERE_COMMANDEMENT = { transmisCommandement: true } as const;
