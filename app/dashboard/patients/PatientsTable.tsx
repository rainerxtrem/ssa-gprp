"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Badge, badgeCouleurStatutAptitude, badgeCouleurStatutVisite } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { initiales } from "@/lib/format";
import { champClasses } from "@/lib/ui";

interface LignePatientComplet {
  id: string;
  rio: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
}

interface LigneSyntheseCommandement {
  patientId: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  statutVisite: string;
  statutAptitude: string;
}

const TOUS = "__tous__";

function valeursDistinctes<T>(items: T[], selecteur: (item: T) => string): string[] {
  return Array.from(new Set(items.map(selecteur))).sort((a, b) => a.localeCompare(b, "fr"));
}

export function PatientsTableComplete({ patients }: { patients: LignePatientComplet[] }) {
  const [recherche, setRecherche] = useState("");
  const [unite, setUnite] = useState(TOUS);
  const [grade, setGrade] = useState(TOUS);

  const unites = useMemo(() => valeursDistinctes(patients, (p) => p.unite), [patients]);
  const grades = useMemo(() => valeursDistinctes(patients, (p) => p.grade), [patients]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return patients.filter((p) => {
      if (unite !== TOUS && p.unite !== unite) return false;
      if (grade !== TOUS && p.grade !== grade) return false;
      if (!q) return true;
      return [p.nom, p.prenom, p.grade, p.unite, p.rio].some((v) => v.toLowerCase().includes(q));
    });
  }, [patients, recherche, unite, grade]);

  return (
    <div>
      <BarreFiltres recherche={recherche} onRechercheChange={setRecherche}>
        <FiltreSelect label="Toutes les unités" valeur={unite} options={unites} onChange={setUnite} />
        <FiltreSelect label="Tous les grades" valeur={grade} options={grades} onChange={setGrade} />
      </BarreFiltres>

      {filtres.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={patients.length === 0 ? "Aucun patient enregistré" : "Aucun résultat"}
          description={
            patients.length === 0
              ? "Ajoutez un premier patient pour commencer le suivi."
              : "Essayez un autre nom, grade, unité ou identifiant."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Unité</th>
                <th className="px-4 py-3 font-medium">RIO</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtres.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/patients/${p.id}`} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                        {initiales(p.nom, p.prenom)}
                      </span>
                      <span className="font-medium text-slate-900 group-hover:text-emerald-800">
                        {p.nom} {p.prenom}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.grade}</td>
                  <td className="px-4 py-3 text-slate-600">{p.unite}</td>
                  <td className="px-4 py-3 text-slate-500">{p.rio}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/patients/${p.id}`}
                      className="text-sm font-medium text-emerald-700 opacity-0 group-hover:opacity-100 hover:underline"
                    >
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PatientsTableCommandement({ syntheses }: { syntheses: LigneSyntheseCommandement[] }) {
  const [recherche, setRecherche] = useState("");
  const [unite, setUnite] = useState(TOUS);
  const [grade, setGrade] = useState(TOUS);
  const [statutAptitude, setStatutAptitude] = useState(TOUS);
  const [statutVisite, setStatutVisite] = useState(TOUS);

  const unites = useMemo(() => valeursDistinctes(syntheses, (p) => p.unite), [syntheses]);
  const grades = useMemo(() => valeursDistinctes(syntheses, (p) => p.grade), [syntheses]);
  const aptitudes = useMemo(() => valeursDistinctes(syntheses, (p) => p.statutAptitude), [syntheses]);
  const visites = useMemo(() => valeursDistinctes(syntheses, (p) => p.statutVisite), [syntheses]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return syntheses.filter((p) => {
      if (unite !== TOUS && p.unite !== unite) return false;
      if (grade !== TOUS && p.grade !== grade) return false;
      if (statutAptitude !== TOUS && p.statutAptitude !== statutAptitude) return false;
      if (statutVisite !== TOUS && p.statutVisite !== statutVisite) return false;
      if (!q) return true;
      return [p.nom, p.prenom, p.grade, p.unite].some((v) => v.toLowerCase().includes(q));
    });
  }, [syntheses, recherche, unite, grade, statutAptitude, statutVisite]);

  return (
    <div>
      <BarreFiltres recherche={recherche} onRechercheChange={setRecherche}>
        <FiltreSelect label="Toutes les unités" valeur={unite} options={unites} onChange={setUnite} />
        <FiltreSelect label="Tous les grades" valeur={grade} options={grades} onChange={setGrade} />
        <FiltreSelect label="Toute aptitude" valeur={statutAptitude} options={aptitudes} onChange={setStatutAptitude} />
        <FiltreSelect label="Tout statut visite" valeur={statutVisite} options={visites} onChange={setStatutVisite} />
      </BarreFiltres>

      {filtres.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="Aucun résultat" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Unité</th>
                <th className="px-4 py-3 font-medium">Statut visite</th>
                <th className="px-4 py-3 font-medium">Statut aptitude</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtres.map((s) => (
                <tr key={s.patientId} className="group hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.nom} {s.prenom}</td>
                  <td className="px-4 py-3 text-slate-600">{s.grade}</td>
                  <td className="px-4 py-3 text-slate-600">{s.unite}</td>
                  <td className="px-4 py-3">
                    <Badge couleur={badgeCouleurStatutVisite(s.statutVisite)}>{s.statutVisite}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge couleur={badgeCouleurStatutAptitude(s.statutAptitude)}>{s.statutAptitude}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/patients/${s.patientId}`}
                      className="text-sm font-medium text-emerald-700 opacity-0 group-hover:opacity-100 hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BarreFiltres({
  recherche,
  onRechercheChange,
  children,
}: {
  recherche: string;
  onRechercheChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={recherche}
          onChange={(e) => onRechercheChange(e.target.value)}
          placeholder="Rechercher un patient..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      {children}
    </div>
  );
}

function FiltreSelect({
  label,
  valeur,
  options,
  onChange,
}: {
  label: string;
  valeur: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length <= 1) return null;
  return (
    <select value={valeur} onChange={(e) => onChange(e.target.value)} className={`${champClasses} w-auto`}>
      <option value={TOUS}>{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
