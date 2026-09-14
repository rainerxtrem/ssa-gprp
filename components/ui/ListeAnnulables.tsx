"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ListeAnnulables({
  actifs,
  annules,
}: {
  actifs: React.ReactNode[];
  annules: React.ReactNode[];
}) {
  const [afficher, setAfficher] = useState(false);

  return (
    <div className="space-y-3">
      {actifs}
      {annules.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setAfficher((v) => !v)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            {afficher ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {afficher ? "Masquer" : "Afficher"} {annules.length} document{annules.length > 1 ? "s" : ""} annulé
            {annules.length > 1 ? "s" : ""}
          </button>
          {afficher && <div className="mt-3 space-y-3">{annules}</div>}
        </div>
      )}
    </div>
  );
}
