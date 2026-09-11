import type { AptitudeStatus, ConclusionEngagement, ConclusionSuivi } from "@prisma/client";

/**
 * Seuils réglementaires : au-delà de l'une de ces valeurs sur le profil SIGYCOP,
 * l'inaptitude est déclarée.
 */
export const SIGYCOP_SEUILS_INAPTITUDE = {
  s: 2,
  i: 2,
  g: 2,
  y: 3,
  c: 3,
  o: 2,
  p: 1,
} as const;

export const SIGYCOP_MENTION_LEGALE =
  "Au-delà de ces valeurs, inaptitude déclarée : S2 I2 G2 Y3 C3 O2 P1";

export type SigycopProfil = {
  s: number;
  i: number;
  g: number;
  y: number;
  c: number;
  o: number;
  p: number;
};

export function depasseSeuilInaptitude(profil: SigycopProfil): boolean {
  return (Object.keys(SIGYCOP_SEUILS_INAPTITUDE) as (keyof typeof SIGYCOP_SEUILS_INAPTITUDE)[]).some(
    (lettre) => profil[lettre] > SIGYCOP_SEUILS_INAPTITUDE[lettre]
  );
}

export const APTITUDE_STATUS_LABELS: Record<AptitudeStatus, string> = {
  APTE: "Apte",
  APTE_RESTRICTION: "Apte avec restriction",
  INAPTE: "Inapte",
  NON_EVALUE: "Non évalué",
};

export const CONCLUSION_SUIVI_LABELS: Record<ConclusionSuivi, string> = {
  APTE_A_SERVIR: "Apte à servir",
  APTE_A_SERVIR_AVEC_RESTRICTION: "Apte à servir avec restriction d'emploi",
  INAPTE_TEMPORAIRE_A_SERVIR: "Inapte temporaire à servir",
  INAPTE_DEFINITIF_A_SERVIR: "Inapte définitif à servir",
};

export const CONCLUSION_ENGAGEMENT_LABELS: Record<ConclusionEngagement, string> = {
  APTE_ENGAGEMENT: "Apte à l'engagement",
  INAPTE_TEMPORAIRE: "Inapte temporaire",
  INAPTE: "Inapte",
  AJOURNEMENT: "Ajournement",
};

/**
 * Statut d'aptitude globale exposé au COMMANDEMENT.
 * Secret médical strict : ne renvoie jamais de diagnostic ni de détail clinique,
 * uniquement l'un des quatre libellés autorisés.
 */
export function statutAptitudeGlobalePourCommandement(
  conclusion: ConclusionSuivi | null | undefined
): "Apte" | "Apte avec restriction" | "Inapte temporaire" | "Inapte définitif" | "Non évalué" {
  switch (conclusion) {
    case "APTE_A_SERVIR":
      return "Apte";
    case "APTE_A_SERVIR_AVEC_RESTRICTION":
      return "Apte avec restriction";
    case "INAPTE_TEMPORAIRE_A_SERVIR":
      return "Inapte temporaire";
    case "INAPTE_DEFINITIF_A_SERVIR":
      return "Inapte définitif";
    default:
      return "Non évalué";
  }
}
