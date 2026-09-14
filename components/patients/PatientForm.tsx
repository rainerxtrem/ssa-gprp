"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";

export interface PatientFormValues {
  rio: string;
  nom: string;
  prenom: string;
  ddn: string; // yyyy-mm-dd
  grade: string;
  specialite: string;
  unite: string;
  antecedents: string;
  allergies: string;
}

export default function PatientForm({
  mode,
  patientId,
  valeursInitiales,
}: {
  mode: "creer" | "modifier";
  patientId?: string;
  valeursInitiales?: PatientFormValues;
}) {
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
      antecedents: form.get("antecedents") || undefined,
      allergies: form.get("allergies") || undefined,
    };

    const url = mode === "creer" ? "/api/patients" : `/api/patients/${patientId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Une erreur est survenue.");
      return;
    }

    const { patient } = await reponse.json();
    router.push(`/dashboard/patients/${patient.id}`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={onSubmit}>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom" name="nom" required defaultValue={valeursInitiales?.nom} />
            <Field label="Prénom" name="prenom" required defaultValue={valeursInitiales?.prenom} />
            <Field label="Date de naissance" name="ddn" type="date" required defaultValue={valeursInitiales?.ddn} />
            <Field label="Identifiant défense (RIO)" name="rio" required defaultValue={valeursInitiales?.rio} />
            <Field label="Grade" name="grade" required defaultValue={valeursInitiales?.grade} />
            <Field label="Unité" name="unite" required defaultValue={valeursInitiales?.unite} />
          </div>
          <Field label="Spécialité" name="specialite" defaultValue={valeursInitiales?.specialite} />
          <FieldTextarea
            label="Antécédents médicaux"
            name="antecedents"
            rows={3}
            defaultValue={valeursInitiales?.antecedents}
          />
          <FieldTextarea
            label="Allergies"
            name="allergies"
            rows={2}
            placeholder="Pénicilline, arachide..."
            defaultValue={valeursInitiales?.allergies}
          />

          {erreur && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={enCours} className={bouton("primaire")}>
              {enCours ? "Enregistrement..." : mode === "creer" ? "Créer le dossier patient" : "Enregistrer les modifications"}
            </button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
