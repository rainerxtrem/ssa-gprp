"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { initiales } from "@/lib/format";

interface ResultatPatient {
  id: string;
  nom: string;
  prenom: string;
  grade: string;
  unite: string;
  rio: string;
}

export function PatientSearch() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState("");
  const [resultats, setResultats] = useState<ResultatPatient[]>([]);
  const [chargement, setChargement] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requete.trim().length < 2) {
      setResultats([]);
      return;
    }
    setChargement(true);
    const identifiant = setTimeout(async () => {
      const reponse = await fetch(`/api/patients/recherche?q=${encodeURIComponent(requete)}`);
      if (reponse.ok) {
        const data = await reponse.json();
        setResultats(data.patients);
      }
      setChargement(false);
    }, 250);
    return () => clearTimeout(identifiant);
  }, [requete]);

  useEffect(() => {
    function onClickExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", onClickExterieur);
    return () => document.removeEventListener("mousedown", onClickExterieur);
  }, []);

  function allerAuDossier(id: string) {
    setOuvert(false);
    setRequete("");
    router.push(`/dashboard/patients/${id}`);
  }

  return (
    <div ref={conteneurRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={requete}
          onChange={(e) => {
            setRequete(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => setOuvert(true)}
          placeholder="Rechercher un patient..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        {requete && (
          <button
            type="button"
            onClick={() => {
              setRequete("");
              setResultats([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {ouvert && requete.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {chargement ? (
            <p className="px-3 py-3 text-sm text-slate-400">Recherche...</p>
          ) : resultats.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-400">Aucun patient trouvé.</p>
          ) : (
            <ul>
              {resultats.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => allerAuDossier(p.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                      {initiales(p.nom, p.prenom)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">
                        {p.nom} {p.prenom}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {p.grade} · {p.unite} · {p.rio}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
