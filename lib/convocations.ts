export const STATUT_CONVOCATION_LABELS: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  HONOREE: "Honorée",
  ANNULEE: "Annulée",
  ABSENT: "Absence constatée",
};

export const STATUT_CONVOCATION_OPTIONS = Object.entries(STATUT_CONVOCATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
