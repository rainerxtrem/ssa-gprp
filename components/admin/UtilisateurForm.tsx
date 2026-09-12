"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, FieldSelect } from "@/components/ui/Field";
import { ROLE_OPTIONS } from "@/lib/roles";
import { bouton, labelClasses } from "@/lib/ui";

export interface UtilisateurValeurs {
  email?: string;
  nom: string;
  prenom: string;
  grade: string;
  role: string;
  actif: boolean;
}

export default function UtilisateurForm({
  mode,
  utilisateurId,
  valeursInitiales,
}: {
  mode: "creer" | "modifier";
  utilisateurId?: string;
  valeursInitiales?: UtilisateurValeurs;
}) {
  const router = useRouter();
  const [actif, setActif] = useState(valeursInitiales?.actif ?? true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> =
      mode === "creer"
        ? {
            email: form.get("email"),
            nom: form.get("nom"),
            prenom: form.get("prenom"),
            grade: form.get("grade"),
            role: form.get("role"),
            motDePasse: form.get("motDePasse"),
          }
        : {
            nom: form.get("nom"),
            prenom: form.get("prenom"),
            grade: form.get("grade"),
            role: form.get("role"),
            actif,
            nouveauMotDePasse: form.get("nouveauMotDePasse") || undefined,
          };

    const url = mode === "creer" ? "/api/utilisateurs" : `/api/utilisateurs/${utilisateurId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }

    router.push("/dashboard/admin/utilisateurs");
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={onSubmit}>
        <CardBody className="space-y-4">
          {mode === "creer" && <Field label="Email" name="email" type="email" required />}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom" name="nom" required defaultValue={valeursInitiales?.nom} />
            <Field label="Prénom" name="prenom" required defaultValue={valeursInitiales?.prenom} />
          </div>
          <Field label="Grade" name="grade" required defaultValue={valeursInitiales?.grade} />
          <FieldSelect label="Rôle" name="role" required defaultValue={valeursInitiales?.role} options={ROLE_OPTIONS} />

          {mode === "creer" ? (
            <Field label="Mot de passe initial" name="motDePasse" type="password" required />
          ) : (
            <>
              <Field label="Nouveau mot de passe (facultatif)" name="nouveauMotDePasse" type="password" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={actif}
                  onChange={(e) => setActif(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className={labelClasses + " mb-0"}>Compte actif</span>
              </label>
            </>
          )}

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={enCours} className={bouton("primaire")}>
              {enCours ? "Enregistrement..." : mode === "creer" ? "Créer le compte" : "Enregistrer les modifications"}
            </button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
