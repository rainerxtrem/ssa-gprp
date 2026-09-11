export const TYPE_EXEMPTION_LABELS: Record<string, string> = {
  ARRET_TRAVAIL: "Arrêt de travail",
  EXEMPTION_SPORT: "Exemption de sport",
  EXEMPTION_SERVICE: "Exemption de service",
  PERMISSION_EXCEPTIONNELLE: "Permission exceptionnelle",
  CONVALESCENCE: "Convalescence",
};

export const TYPE_EXEMPTION_OPTIONS = Object.entries(TYPE_EXEMPTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
