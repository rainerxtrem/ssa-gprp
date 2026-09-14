export interface ModeleConsultation {
  motif: string;
  anamnese?: string;
  examenClinique?: string;
  diagnostic?: string;
  conduiteATenir?: string;
  /** Réservé au suivi infirmier autonome (maladie chronique, post-pathologie). */
  suiviInfirmier?: boolean;
}

/** Modèles pour le suivi infirmier autonome — jamais de conclusion d'aptitude. */
export const MODELES_SUIVI_INFIRMIER: ModeleConsultation[] = [
  {
    motif: "Suivi asthme",
    anamnese: "Point d'évolution : fréquence des crises, observance du traitement de fond, facteurs déclenchants.",
    examenClinique: "Auscultation pulmonaire, débit expiratoire de pointe si disponible.",
    conduiteATenir: "Rappel des règles hygiéno-diététiques et de l'observance. Orientation médecin si signe d'aggravation.",
    suiviInfirmier: true,
  },
  {
    motif: "Suivi diabète",
    anamnese: "Point sur l'équilibre glycémique, observance du traitement, signes d'hypo/hyperglycémie.",
    examenClinique: "Glycémie capillaire, examen des points d'injection si insulinothérapie, état cutané des pieds.",
    conduiteATenir: "Renforcement de l'éducation thérapeutique. Orientation médecin si déséquilibre persistant.",
    suiviInfirmier: true,
  },
  {
    motif: "Suivi post-opératoire",
    anamnese: "Évolution depuis l'intervention, douleur, reprise progressive des activités.",
    examenClinique: "Aspect de la cicatrice, absence de signe infectieux local.",
    conduiteATenir: "Poursuite des soins de plaie prescrits. Orientation médecin si signe d'infection ou de complication.",
    suiviInfirmier: true,
  },
  {
    motif: "Pansement / soins de plaie",
    examenClinique: "Aspect de la plaie, exsudat, berges, signes inflammatoires.",
    conduiteATenir: "Réfection du pansement selon protocole. Orientation médecin si absence d'amélioration.",
    suiviInfirmier: true,
  },
];

export const MODELES_CONSULTATION: ModeleConsultation[] = [
  {
    motif: "Angine",
    anamnese: "Odynophagie évoluant depuis quelques jours, sans autre signe associé notable.",
    examenClinique: "Amygdales érythémateuses, +/- exsudat. Pas de dyspnée. Ganglions cervicaux souples.",
    diagnostic: "Angine",
    conduiteATenir: "Antalgiques/antipyrétiques. Réévaluation si persistance au-delà de 3 jours ou signes de gravité.",
  },
  {
    motif: "Entorse de cheville",
    anamnese: "Traumatisme en inversion lors d'un exercice physique, douleur et gonflement immédiat.",
    examenClinique: "Œdème malléolaire externe, douleur à la palpation du ligament, appui possible mais douloureux.",
    diagnostic: "Entorse de cheville, grade à préciser",
    conduiteATenir: "Protocole RICE (repos, glace, compression, élévation). Contention. Repos sportif.",
  },
  {
    motif: "Rhinopharyngite",
    anamnese: "Rhinorrhée, obstruction nasale, toux, sans fièvre élevée.",
    examenClinique: "Muqueuse nasale congestive, pharynx discrètement inflammatoire. Auscultation pulmonaire normale.",
    diagnostic: "Rhinopharyngite",
    conduiteATenir: "Traitement symptomatique. Réévaluation si aggravation ou fièvre persistante.",
  },
  {
    motif: "Lombalgie",
    anamnese: "Douleur lombaire d'apparition récente, sans traumatisme franc, sans irradiation.",
    examenClinique: "Contracture paravertébrale, mobilité rachidienne limitée par la douleur, pas de signe neurologique.",
    diagnostic: "Lombalgie commune",
    conduiteATenir: "Antalgiques, maintien d'une activité adaptée. Réévaluation si signe neurologique ou non-amélioration.",
  },
  {
    motif: "Gastro-entérite",
    anamnese: "Diarrhée et vomissements d'apparition brutale, sans notion de contage précis.",
    examenClinique: "Abdomen souple, pas de défense. Pas de signe de déshydratation sévère.",
    diagnostic: "Gastro-entérite aiguë probable",
    conduiteATenir: "Réhydratation, régime adapté. Réévaluation si persistance au-delà de 48h ou signes de déshydratation.",
  },
  {
    motif: "Céphalées",
    anamnese: "Céphalées d'apparition progressive, sans signe d'alarme rapporté.",
    examenClinique: "Examen neurologique sans particularité. Pas de raideur méningée.",
    diagnostic: "Céphalées de tension probables",
    conduiteATenir: "Antalgiques simples. Réévaluation si céphalée inhabituelle, brutale ou signe neurologique associé.",
  },
  {
    motif: "Contusion",
    anamnese: "Choc direct récent, douleur localisée sans impotence fonctionnelle majeure.",
    examenClinique: "Ecchymose/œdème localisé, mobilité conservée, pas de déformation.",
    diagnostic: "Contusion simple",
    conduiteATenir: "Antalgiques, glace locale. Réévaluation si aggravation ou apparition d'une impotence fonctionnelle.",
  },
];
