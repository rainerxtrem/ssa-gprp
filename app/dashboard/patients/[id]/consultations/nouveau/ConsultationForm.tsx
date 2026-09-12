"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";

export interface ConsultationValeurs {
  motif: string;
  anamnese: string;
  examenClinique: string;
  temperature: string;
  tensionSystolique: string;
  tensionDiastolique: string;
  frequenceCardiaque: string;
  saturationO2: string;
  poids: string;
  taille: string;
  diagnostic: string;
  conduiteATenir: string;
}

export default function ConsultationForm({
  patientId,
  mode = "creer",
  consultationId,
  valeursInitiales,
}: {
  patientId: string;
  mode?: "creer" | "modifier";
  consultationId?: string;
  valeursInitiales?: ConsultationValeurs;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const nombreOuUndefined = (key: string) => {
      const v = form.get(key);
      return v && String(v).trim() !== "" ? Number(v) : undefined;
    };

    const payload = {
      ...(mode === "creer" ? { patientId } : {}),
      motif: form.get("motif"),
      anamnese: form.get("anamnese") || undefined,
      examenClinique: form.get("examenClinique") || undefined,
      temperature: nombreOuUndefined("temperature"),
      tensionSystolique: nombreOuUndefined("tensionSystolique"),
      tensionDiastolique: nombreOuUndefined("tensionDiastolique"),
      frequenceCardiaque: nombreOuUndefined("frequenceCardiaque"),
      saturationO2: nombreOuUndefined("saturationO2"),
      poids: nombreOuUndefined("poids"),
      taille: nombreOuUndefined("taille"),
      diagnostic: form.get("diagnostic") || undefined,
      conduiteATenir: form.get("conduiteATenir") || undefined,
    };

    const url = mode === "creer" ? "/api/consultations" : `/api/consultations/${consultationId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement de la consultation.");
      return;
    }

    if (mode === "creer") {
      router.push(`/dashboard/patients/${patientId}?onglet=suivi`);
    } else {
      router.push(`/dashboard/patients/${patientId}/consultations/${consultationId}`);
    }
    router.refresh();
  }

  const v = valeursInitiales;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader title="Motif et anamnèse" />
        <CardBody className="space-y-4">
          <Field label="Motif de consultation" name="motif" required defaultValue={v?.motif} />
          <FieldTextarea label="Anamnèse" name="anamnese" rows={3} defaultValue={v?.anamnese} />
          <FieldTextarea label="Examen clinique" name="examenClinique" rows={3} defaultValue={v?.examenClinique} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Constantes" description="Facultatif — laisser vide si non mesuré" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Température (°C)" name="temperature" type="number" defaultValue={v?.temperature} />
          <Field label="Tension systolique" name="tensionSystolique" type="number" defaultValue={v?.tensionSystolique} />
          <Field label="Tension diastolique" name="tensionDiastolique" type="number" defaultValue={v?.tensionDiastolique} />
          <Field label="Fréquence cardiaque" name="frequenceCardiaque" type="number" defaultValue={v?.frequenceCardiaque} />
          <Field label="Saturation O2 (%)" name="saturationO2" type="number" defaultValue={v?.saturationO2} />
          <Field label="Poids (kg)" name="poids" type="number" defaultValue={v?.poids} />
          <Field label="Taille (cm)" name="taille" type="number" defaultValue={v?.taille} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Conclusion" />
        <CardBody className="space-y-4">
          <FieldTextarea label="Diagnostic" name="diagnostic" rows={3} defaultValue={v?.diagnostic} />
          <FieldTextarea label="Conduite à tenir" name="conduiteATenir" rows={3} defaultValue={v?.conduiteATenir} />
        </CardBody>
      </Card>

      {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours} className={bouton("primaire")}>
          {enCours ? "Enregistrement..." : mode === "creer" ? "Enregistrer la consultation" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
