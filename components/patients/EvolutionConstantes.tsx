"use client";

import { useState } from "react";
import { LineChart, type SerieCourbe } from "@/components/ui/LineChart";
import { formatDateFr } from "@/lib/format";

export interface ConsultationConstante {
  dateConsultation: string; // ISO
  temperature: number | null;
  tensionSystolique: number | null;
  tensionDiastolique: number | null;
  frequenceCardiaque: number | null;
  saturationO2: number | null;
  poids: number | null;
}

type Metrique = "poids" | "tension" | "frequenceCardiaque" | "temperature" | "saturationO2";

const METRIQUES: { cle: Metrique; label: string }[] = [
  { cle: "poids", label: "Poids" },
  { cle: "tension", label: "Tension artérielle" },
  { cle: "frequenceCardiaque", label: "Fréquence cardiaque" },
  { cle: "temperature", label: "Température" },
  { cle: "saturationO2", label: "Saturation O2" },
];

export function EvolutionConstantes({ consultations }: { consultations: ConsultationConstante[] }) {
  const [metrique, setMetrique] = useState<Metrique>("poids");

  // Ordre chronologique croissant pour le graphique (les consultations sont listées desc par ailleurs).
  const chrono = [...consultations].reverse();

  function seriePour(m: Metrique): SerieCourbe[] {
    const pointsAvec = (accesseur: (c: ConsultationConstante) => number | null, couleur: string, nom: string, unite: string) => {
      const points = chrono
        .filter((c) => accesseur(c) !== null)
        .map((c) => ({ date: formatDateFr(c.dateConsultation), valeur: accesseur(c) as number }));
      return { nom, couleur, points, unite };
    };

    switch (m) {
      case "poids":
        return [pointsAvec((c) => c.poids, "#059669", "Poids", "kg")];
      case "tension":
        return [
          pointsAvec((c) => c.tensionSystolique, "#dc2626", "Systolique", "mmHg"),
          pointsAvec((c) => c.tensionDiastolique, "#2563eb", "Diastolique", "mmHg"),
        ];
      case "frequenceCardiaque":
        return [pointsAvec((c) => c.frequenceCardiaque, "#dc2626", "FC", "bpm")];
      case "temperature":
        return [pointsAvec((c) => c.temperature, "#ea580c", "Température", "°C")];
      case "saturationO2":
        return [pointsAvec((c) => c.saturationO2, "#0891b2", "SpO2", "%")];
    }
  }

  const series = seriePour(metrique);
  const aDesDonnees = series.some((s) => s.points.length > 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {METRIQUES.map((m) => (
          <button
            key={m.cle}
            type="button"
            onClick={() => setMetrique(m.cle)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              metrique === m.cle ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {aDesDonnees ? (
        <LineChart series={series} />
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">
          Aucune mesure de {METRIQUES.find((m) => m.cle === metrique)?.label.toLowerCase()} enregistrée.
        </p>
      )}
    </div>
  );
}
