"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Paperclip, Trash2, UploadCloud } from "lucide-react";
import { bouton } from "@/lib/ui";
import { formatDateFr } from "@/lib/format";

export interface PieceJointeItem {
  id: string;
  nomFichier: string;
  typeMime: string;
  taille: number;
  createdAt: string;
}

const TYPES_AUTORISES = ["image/png", "image/jpeg", "application/pdf"];

function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export function PieceJointeUploader({ consultationId, pieces, peutModifier }: { consultationId: string; pieces: PieceJointeItem[]; peutModifier: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onFichierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur(null);

    if (!TYPES_AUTORISES.includes(fichier.type)) {
      setErreur("Type de fichier non autorisé (PNG, JPEG ou PDF uniquement).");
      e.target.value = "";
      return;
    }
    if (fichier.size > 8 * 1024 * 1024) {
      setErreur("Le fichier dépasse la taille maximale de 8 Mo.");
      e.target.value = "";
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = async () => {
      setEnCours(true);
      const reponse = await fetch(`/api/consultations/${consultationId}/pieces-jointes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomFichier: fichier.name,
          typeMime: fichier.type,
          contenuBase64: lecteur.result as string,
        }),
      });
      setEnCours(false);
      e.target.value = "";

      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setErreur(data.error ?? "Erreur lors de l'envoi du fichier.");
        return;
      }
      router.refresh();
    };
    lecteur.readAsDataURL(fichier);
  }

  async function supprimer(pieceId: string) {
    setEnCours(true);
    const reponse = await fetch(`/api/pieces-jointes/${pieceId}`, { method: "DELETE" });
    setEnCours(false);
    if (reponse.ok) router.refresh();
  }

  return (
    <div>
      {pieces.length === 0 ? (
        <p className="text-sm text-slate-400">Aucune pièce jointe.</p>
      ) : (
        <ul className="space-y-2">
          {pieces.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <a
                href={`/api/pieces-jointes/${p.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm text-emerald-700 hover:underline"
              >
                {p.typeMime === "application/pdf" ? (
                  <FileText className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ImageIcon className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">{p.nomFichier}</span>
              </a>
              <div className="flex flex-shrink-0 items-center gap-2 text-xs text-slate-400">
                <span>{formatTaille(p.taille)}</span>
                <span>{formatDateFr(p.createdAt)}</span>
                {peutModifier && (
                  <button
                    type="button"
                    onClick={() => supprimer(p.id)}
                    disabled={enCours}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Supprimer la pièce jointe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {peutModifier && (
        <div className="mt-3">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,application/pdf" onChange={onFichierChange} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={enCours} className={bouton("secondaire", "sm")}>
            <UploadCloud className="h-4 w-4" />
            Ajouter une pièce jointe
          </button>
          {erreur && <p className="mt-2 text-sm text-red-700">{erreur}</p>}
        </div>
      )}
    </div>
  );
}

export const PieceJointeIcon = Paperclip;
