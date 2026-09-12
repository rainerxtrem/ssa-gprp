"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { bouton, champClasses, labelClasses } from "@/lib/ui";

export function AnnulerAction({
  endpoint,
  corpsSupplementaire,
  confirmationLabel = "Annuler ce document",
}: {
  endpoint: string;
  corpsSupplementaire?: Record<string, unknown>;
  confirmationLabel?: string;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function confirmer() {
    if (!motif.trim()) {
      setErreur("Merci d'indiquer un motif d'annulation.");
      return;
    }
    setEnCours(true);
    setErreur(null);

    const reponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motif, ...corpsSupplementaire }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'annulation.");
      return;
    }

    router.refresh();
    setOuvert(false);
  }

  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className={bouton("danger", "sm")}>
        <Ban className="h-4 w-4" />
        Annuler
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-3">
      <p className={labelClasses}>{confirmationLabel}</p>
      <textarea
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={2}
        placeholder="Motif de l'annulation"
        className={champClasses}
      />
      {erreur && <p className="mt-1 text-sm text-red-700">{erreur}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => setOuvert(false)} className={bouton("discret", "sm")}>
          Retour
        </button>
        <button type="button" onClick={confirmer} disabled={enCours} className={bouton("danger", "sm")}>
          {enCours ? "Annulation..." : "Confirmer l'annulation"}
        </button>
      </div>
    </div>
  );
}
