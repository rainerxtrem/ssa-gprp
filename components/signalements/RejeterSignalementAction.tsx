"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { bouton, champClasses, labelClasses } from "@/lib/ui";

export function RejeterSignalementAction({ signalementId }: { signalementId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function confirmer() {
    if (!commentaire.trim()) {
      setErreur("Merci d'indiquer le motif du rejet, pour l'infirmier qui a déclaré le signalement.");
      return;
    }
    setEnCours(true);
    setErreur(null);

    const reponse = await fetch(`/api/signalements/${signalementId}/rejeter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentaireMedecin: commentaire }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors du rejet du signalement.");
      return;
    }

    router.refresh();
    setOuvert(false);
  }

  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className={bouton("discret", "sm")}>
        <X className="h-4 w-4" />
        Rejeter
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className={labelClasses}>Motif du rejet</p>
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        rows={2}
        placeholder="Pourquoi ce signalement n'est pas retenu"
        className={champClasses}
      />
      {erreur && <p className="mt-1 text-sm text-red-700">{erreur}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => setOuvert(false)} className={bouton("discret", "sm")}>
          Retour
        </button>
        <button type="button" onClick={confirmer} disabled={enCours} className={bouton("secondaire", "sm")}>
          {enCours ? "Envoi..." : "Confirmer le rejet"}
        </button>
      </div>
    </div>
  );
}
