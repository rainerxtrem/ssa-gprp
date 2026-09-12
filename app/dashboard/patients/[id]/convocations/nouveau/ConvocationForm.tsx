"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { bouton } from "@/lib/ui";

export default function ConvocationForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      patientId,
      dateConvocation: form.get("dateConvocation"),
      motif: form.get("motif") || undefined,
    };

    const reponse = await fetch("/api/convocations", {
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
    <Card className="max-w-lg">
      <form onSubmit={onSubmit}>
        <CardBody className="space-y-4">
          <Field label="Date de la visite" name="dateConvocation" type="date" required />
          <FieldTextarea label="Motif (facultatif)" name="motif" rows={3} />

          {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={enCours} className={bouton("primaire")}>
              {enCours ? "Enregistrement..." : "Générer la convocation"}
            </button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}
