"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Field, FieldSelect, FieldTextarea } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { bouton } from "@/lib/ui";
import { APTITUDE_STATUS_LABELS } from "@/lib/sigycop";

export default function SignalementForm({ patientId }: { patientId: string }) {
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
      motif: String(form.get("motif") ?? ""),
      observations: String(form.get("observations") ?? "") || undefined,
      recommandation: String(form.get("recommandation") ?? "NON_EVALUE"),
    };

    const reponse = await fetch("/api/signalements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement du signalement.");
      return;
    }

    router.push(`/dashboard/patients/${patientId}?onglet=aptitudes`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          Ce signalement n&apos;est pas une décision d&apos;aptitude : il sera transmis à un médecin, qui
          l&apos;homologuera (générant le certificat officiel) ou le rejettera. Il apparaît immédiatement dans la
          file d&apos;attente des médecins.
        </p>
      </div>

      <Card>
        <CardHeader title="Signalement" />
        <CardBody className="space-y-4">
          <Field label="Motif" name="motif" required placeholder="Ce qui a été observé pendant le suivi" />
          <FieldTextarea
            label="Observations"
            name="observations"
            rows={4}
            placeholder="Éléments cliniques ou de contexte utiles au médecin pour trancher"
          />
          <FieldSelect
            label="Recommandation (indicative)"
            name="recommandation"
            defaultValue="NON_EVALUE"
            options={Object.entries(APTITUDE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </CardBody>
      </Card>

      {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours} className={bouton("primaire")}>
          {enCours ? "Envoi en cours..." : "Transmettre le signalement"}
        </button>
      </div>
    </form>
  );
}
