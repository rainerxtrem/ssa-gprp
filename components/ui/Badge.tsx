export type BadgeCouleur = "emerald" | "red" | "amber" | "slate" | "sky";

const COULEURS: Record<BadgeCouleur, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function Badge({ children, couleur = "slate" }: { children: React.ReactNode; couleur?: BadgeCouleur }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COULEURS[couleur]}`}
    >
      {children}
    </span>
  );
}

export function badgeCouleurStatutAptitude(statut: string): BadgeCouleur {
  if (statut === "Apte") return "emerald";
  if (statut === "Apte avec restriction") return "amber";
  if (statut.startsWith("Inapte")) return "red";
  return "slate";
}

export function badgeCouleurStatutVisite(statut: string): BadgeCouleur {
  if (statut === "À jour") return "emerald";
  if (statut === "En retard") return "red";
  return "amber";
}
