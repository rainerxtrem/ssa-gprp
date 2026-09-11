"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouveauPatientForm() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      rio: form.get("rio"),
      nom: form.get("nom"),
      prenom: form.get("prenom"),
      ddn: form.get("ddn"),
      grade: form.get("grade"),
      specialite: form.get("specialite") || undefined,
      unite: form.get("unite"),
    };

    const reponse = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de la création du patient.");
      return;
    }

    const { patient } = await reponse.json();
    router.push(`/dashboard/patients/${patient.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-4">
        <Champ label="Nom" name="nom" required />
        <Champ label="Prénom" name="prenom" required />
        <Champ label="Date de naissance" name="ddn" type="date" required />
        <Champ label="Identifiant défense (RIO)" name="rio" required />
        <Champ label="Grade" name="grade" required />
        <Champ label="Unité" name="unite" required />
      </div>
      <Champ label="Spécialité" name="specialite" />

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {enCours ? "Création..." : "Créer le dossier patient"}
      </button>
    </form>
  );
}

function Champ({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
      />
    </label>
  );
}
