"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, FieldSelect, FieldTextarea } from "@/components/ui/Field";
import { TYPE_EXEMPTION_OPTIONS } from "@/lib/arrets";
import { bouton, labelClasses } from "@/lib/ui";

export default function ArretForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [transmis, setTransmis] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      patientId,
      typeExemption: form.get("typeExemption"),
      dateDebut: form.get("dateDebut"),
      dateFin: form.get("dateFin"),
      motif: form.get("motif") || undefined,
      transmisCommandement: transmis,
    };

    const reponse = await fetch("/api/arrets-travail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }

    router.push(`/dashboard/patients/${patientId}?onglet=suivi`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={onSubmit}>
        <CardBody className="space-y-4">
          <FieldSelect
            label="Type"
            name="typeExemption"
            required
            defaultValue="ARRET_TRAVAIL"
            options={TYPE_EXEMPTION_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de début" name="dateDebut" type="date" required />
            <Field label="Date de fin" name="dateFin" type="date" required />
          </div>
          <FieldTextarea
            label="Motif (secret médical — jamais transmis au commandement)"
            name="motif"
            rows={3}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={transmis}
              onChange={(e) => setTransmis(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className={labelClasses + " mb-0"}>Transmettre le statut (dates + type) au commandement</span>
          </label>

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={enCours} className={bouton("primaire")}>
              {enCours ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
