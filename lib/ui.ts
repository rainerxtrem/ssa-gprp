export type BoutonVariante = "primaire" | "secondaire" | "discret" | "danger";
export type BoutonTaille = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 focus-visible:ring-emerald-600";

const VARIANTES: Record<BoutonVariante, string> = {
  primaire: "bg-emerald-700 text-white hover:bg-emerald-800",
  secondaire: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  discret: "text-slate-600 hover:bg-slate-100",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

const TAILLES: Record<BoutonTaille, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function bouton(variante: BoutonVariante = "primaire", taille: BoutonTaille = "md"): string {
  return `${BASE} ${VARIANTES[variante]} ${TAILLES[taille]}`;
}

export const champClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none " +
  "transition-shadow placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export const labelClasses = "mb-1.5 block text-sm font-medium text-slate-700";
