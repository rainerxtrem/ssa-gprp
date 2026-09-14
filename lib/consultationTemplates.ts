export interface ModeleConsultation {
  motif: string;
  anamnese?: string;
  examenClinique?: string;
  diagnostic?: string;
  conduiteATenir?: string;
}

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
