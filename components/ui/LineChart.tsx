"use client";

import { useState } from "react";

export interface PointCourbe {
  date: string; // libellé affiché (ex: "12/03/2026")
  valeur: number;
}

export interface SerieCourbe {
  nom: string;
  couleur: string;
  points: PointCourbe[];
  unite?: string;
}

/** Petit graphique en courbe en SVG pur, sans dépendance externe. */
export function LineChart({ series, hauteur = 180 }: { series: SerieCourbe[]; hauteur?: number }) {
  const [survol, setSurvol] = useState<{ serie: string; point: PointCourbe; x: number; y: number } | null>(null);

  const toutesValeurs = series.flatMap((s) => s.points.map((p) => p.valeur));
  if (toutesValeurs.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Aucune donnée à afficher.</p>;
  }

  const largeur = 600;
  const marge = { haut: 16, bas: 28, gauche: 8, droite: 8 };
  const min = Math.min(...toutesValeurs);
  const max = Math.max(...toutesValeurs);
  const etendue = max - min || 1;
  const zoneH = hauteur - marge.haut - marge.bas;
  const zoneL = largeur - marge.gauche - marge.droite;

  const nbPoints = Math.max(...series.map((s) => s.points.length), 2);

  function coordX(index: number): number {
    return marge.gauche + (nbPoints === 1 ? zoneL / 2 : (index / (nbPoints - 1)) * zoneL);
  }
  function coordY(valeur: number): number {
    return marge.haut + zoneH - ((valeur - min) / etendue) * zoneH;
  }

  const labelsAxe = series.reduce<string[]>((acc, s) => (s.points.length > acc.length ? s.points.map((p) => p.date) : acc), []);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="w-full" style={{ height: hauteur }}>
        {/* lignes de repère horizontales */}
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={marge.gauche}
            x2={largeur - marge.droite}
            y1={marge.haut + zoneH * f}
            y2={marge.haut + zoneH * f}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {series.map((serie) => {
          if (serie.points.length === 0) return null;
          const chemin = serie.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${coordX(i)} ${coordY(p.valeur)}`)
            .join(" ");
          return (
            <g key={serie.nom}>
              <path d={chemin} fill="none" stroke={serie.couleur} strokeWidth={2} />
              {serie.points.map((p, i) => (
                <circle
                  key={i}
                  cx={coordX(i)}
                  cy={coordY(p.valeur)}
                  r={3.5}
                  fill={serie.couleur}
                  onMouseEnter={() => setSurvol({ serie: serie.nom, point: p, x: coordX(i), y: coordY(p.valeur) })}
                  onMouseLeave={() => setSurvol(null)}
                  className="cursor-pointer"
                />
              ))}
            </g>
          );
        })}

        {labelsAxe.map((label, i) => (
          <text
            key={i}
            x={coordX(i)}
            y={hauteur - 8}
            fontSize={9}
            fill="#94a3b8"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      {survol && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow"
          style={{ left: `${(survol.x / largeur) * 100}%`, top: `${(survol.y / hauteur) * 100}%` }}
        >
          {survol.serie} : {survol.point.valeur} — {survol.point.date}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <div key={s.nom} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.couleur }} />
            {s.nom} {s.unite && `(${s.unite})`}
          </div>
        ))}
      </div>
    </div>
  );
}
