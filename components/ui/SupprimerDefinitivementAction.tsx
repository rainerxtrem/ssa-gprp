"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { bouton, champClasses, labelClasses } from "@/lib/ui";

export function SupprimerDefinitivementAction({
  endpoint,
  corpsSupplementaire,
  redirectionApres,
}: {
  endpoint: string;
  corpsSupplementaire?: Record<string, unknown>;
  /** URL vers laquelle rediriger une fois le document supprimé. */
  redirectionApres: string;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function confirmer() {
    if (!motif.trim()) {
      setErreur("Merci d'indiquer un motif.");
      return;
    }
    if (confirmation !== "SUPPRIMER") {
      setErreur('Tapez "SUPPRIMER" pour confirmer.');
      return;
    }
    setEnCours(true);
    setErreur(null);

    const reponse = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motif, ...corpsSupplementaire }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de la suppression.");
      return;
    }

    router.push(redirectionApres);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className={bouton("danger", "sm")}>
        <Trash2 className="h-4 w-4" />
        Supprimer définitivement
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-red-300 bg-red-50 p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-red-800">
        <AlertTriangle className="h-4 w-4" />
        Action irréversible
      </p>
      <p className="mt-1 text-xs text-red-700">
        Le document sera supprimé définitivement, sans conservation d&apos;historique. À réserver aux documents
        manifestement erronés — préférez l&apos;annulation pour un acte médical réel.
      </p>
      <label className="mt-2 block">
        <span className={labelClasses}>Motif</span>
        <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={2} className={champClasses} />
      </label>
      <label className="mt-2 block">
        <span className={labelClasses}>Tapez SUPPRIMER pour confirmer</span>
        <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={champClasses} />
      </label>
      {erreur && <p className="mt-1 text-sm text-red-700">{erreur}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => setOuvert(false)} className={bouton("discret", "sm")}>
          Annuler
        </button>
        <button type="button" onClick={confirmer} disabled={enCours} className={bouton("danger", "sm")}>
          {enCours ? "Suppression..." : "Supprimer définitivement"}
        </button>
      </div>
    </div>
  );
}
