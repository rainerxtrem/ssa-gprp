"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";

export default function ConsultationForm({ patientId }: { patientId: string }) {
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
      patientId,
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

    const reponse = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement de la consultation.");
      return;
    }

    router.push(`/dashboard/patients/${patientId}?onglet=suivi`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader title="Motif et anamnèse" />
        <CardBody className="space-y-4">
          <Field label="Motif de consultation" name="motif" required />
          <FieldTextarea label="Anamnèse" name="anamnese" rows={3} />
          <FieldTextarea label="Examen clinique" name="examenClinique" rows={3} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Constantes" description="Facultatif — laisser vide si non mesuré" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Température (°C)" name="temperature" type="number" />
          <Field label="Tension systolique" name="tensionSystolique" type="number" />
          <Field label="Tension diastolique" name="tensionDiastolique" type="number" />
          <Field label="Fréquence cardiaque" name="frequenceCardiaque" type="number" />
          <Field label="Saturation O2 (%)" name="saturationO2" type="number" />
          <Field label="Poids (kg)" name="poids" type="number" />
          <Field label="Taille (cm)" name="taille" type="number" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Conclusion" />
        <CardBody className="space-y-4">
          <FieldTextarea label="Diagnostic" name="diagnostic" rows={3} />
          <FieldTextarea label="Conduite à tenir" name="conduiteATenir" rows={3} />
        </CardBody>
      </Card>

      {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours} className={bouton("primaire")}>
          {enCours ? "Enregistrement..." : "Enregistrer la consultation"}
        </button>
      </div>
    </form>
  );
}
