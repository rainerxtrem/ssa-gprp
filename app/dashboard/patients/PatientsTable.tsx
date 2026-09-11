"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge, badgeCouleurStatutAptitude, badgeCouleurStatutVisite } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { initiales } from "@/lib/format";
import { Users } from "lucide-react";

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

export function PatientsTableComplete({ patients }: { patients: LignePatientComplet[] }) {
  const [recherche, setRecherche] = useState("");

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [p.nom, p.prenom, p.grade, p.unite, p.rio].some((v) => v.toLowerCase().includes(q))
    );
  }, [patients, recherche]);

  return (
    <div>
      <BarreRecherche recherche={recherche} onChange={setRecherche} />
      {filtres.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={patients.length === 0 ? "Aucun patient enregistré" : "Aucun résultat"}
          description={
            patients.length === 0
              ? "Ajoutez un premier patient pour commencer le suivi."
              : "Essayez un autre nom, grade ou identifiant."
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

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return syntheses;
    return syntheses.filter((p) => [p.nom, p.prenom, p.grade, p.unite].some((v) => v.toLowerCase().includes(q)));
  }, [syntheses, recherche]);

  return (
    <div>
      <BarreRecherche recherche={recherche} onChange={setRecherche} />
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

function BarreRecherche({ recherche, onChange }: { recherche: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={recherche}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un patient..."
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}
