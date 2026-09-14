"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { champClasses } from "@/lib/ui";

interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  grade: string;
}

export default function ReferentsClient({
  unites,
  medecins,
  referentsActuels,
}: {
  unites: string[];
  medecins: Medecin[];
  referentsActuels: Record<string, string | null>;
}) {
  const router = useRouter();
  const [valeurs, setValeurs] = useState<Record<string, string>>(
    Object.fromEntries(unites.map((u) => [u, referentsActuels[u] ?? ""]))
  );
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function changer(unite: string, medecinId: string) {
    setValeurs((v) => ({ ...v, [unite]: medecinId }));
    setEnCours(unite);
    setErreur(null);

    const reponse = await fetch("/api/referents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unite, medecinId: medecinId || null }),
    });

    setEnCours(null);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    router.refresh();
  }

  if (unites.length === 0) {
    return <EmptyState title="Aucune unité" description="Les unités apparaissent dès qu'un patient leur est rattaché." />;
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2 pr-4 font-medium">Unité</th>
                <th className="pb-2 pr-4 font-medium">Médecin référent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unites.map((unite) => (
                <tr key={unite}>
                  <td className="py-2 pr-4 font-medium text-slate-900">{unite}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={valeurs[unite] ?? ""}
                      onChange={(e) => changer(unite, e.target.value)}
                      disabled={enCours === unite}
                      className={`${champClasses} max-w-xs`}
                    >
                      <option value="">— Aucun —</option>
                      {medecins.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.grade} {m.prenom} {m.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
