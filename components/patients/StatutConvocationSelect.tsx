"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUT_CONVOCATION_OPTIONS } from "@/lib/convocations";
import { champClasses } from "@/lib/ui";

export function StatutConvocationSelect({ convocationId, statutActuel }: { convocationId: string; statutActuel: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function onChange(statut: string) {
    setEnCours(true);
    const reponse = await fetch(`/api/convocations/${convocationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    setEnCours(false);
    if (reponse.ok) router.refresh();
  }

  return (
    <select
      defaultValue={statutActuel}
      disabled={enCours}
      onChange={(e) => onChange(e.target.value)}
      className={`${champClasses} w-auto py-1 text-sm`}
    >
      {STATUT_CONVOCATION_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
