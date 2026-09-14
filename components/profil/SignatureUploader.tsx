"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UploadCloud } from "lucide-react";
import { bouton } from "@/lib/ui";

export function SignatureUploader({ aUneSignature }: { aUneSignature: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  function choisirFichier() {
    inputRef.current?.click();
  }

  async function onFichierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur(null);

    if (fichier.type !== "image/png") {
      setErreur("Le fichier doit être une image PNG (idéalement à fond transparent).");
      e.target.value = "";
      return;
    }
    if (fichier.size > 500 * 1024) {
      setErreur("L'image dépasse la taille maximale de 500 Ko.");
      e.target.value = "";
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = async () => {
      const imageBase64 = lecteur.result as string;
      setApercu(imageBase64);
      setEnCours(true);

      const reponse = await fetch("/api/utilisateurs/moi/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      setEnCours(false);

      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setErreur(data.error ?? "Erreur lors de l'envoi de la signature.");
        return;
      }

      router.refresh();
    };
    lecteur.readAsDataURL(fichier);
  }

  async function supprimer() {
    setEnCours(true);
    const reponse = await fetch("/api/utilisateurs/moi/signature", { method: "DELETE" });
    setEnCours(false);
    if (reponse.ok) {
      setApercu(null);
      router.refresh();
    }
  }

  const imageAffichee = apercu ?? (aUneSignature ? `/api/utilisateurs/moi/signature?t=${Date.now()}` : null);

  return (
    <div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-28 w-56 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] bg-[length:16px_16px] p-2">
          {imageAffichee ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageAffichee} alt="Signature" className="max-h-full max-w-full object-contain" />
          ) : (
            <p className="text-center text-xs text-slate-400">Aucune signature</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/png" onChange={onFichierChange} className="hidden" />
          <button type="button" onClick={choisirFichier} disabled={enCours} className={bouton("secondaire", "sm")}>
            <UploadCloud className="h-4 w-4" />
            {aUneSignature ? "Remplacer la signature" : "Déposer une signature PNG"}
          </button>
          {aUneSignature && (
            <button type="button" onClick={supprimer} disabled={enCours} className={bouton("discret", "sm")}>
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          )}
          <p className="max-w-xs text-xs text-slate-400">
            PNG à fond transparent recommandé, 500 Ko max. Elle sera apposée automatiquement dans
            l&apos;emplacement signature des certificats et ordonnances que vous générez.
          </p>
        </div>
      </div>

      {erreur && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
    </div>
  );
}
