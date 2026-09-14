"use client";

import { useState } from "react";
import { AlertTriangle, Printer, Save } from "lucide-react";
import {
  APTITUDE_STATUS_LABELS,
  CONCLUSION_ENGAGEMENT_LABELS,
  CONCLUSION_SUIVI_LABELS,
  SIGYCOP_MENTION_LEGALE,
  depasseSeuilInaptitude,
} from "@/lib/sigycop";
import { bouton } from "@/lib/ui";

export type CertificatType = "ENGAGEMENT" | "SUIVI";
type AptitudeStatus = "APTE" | "APTE_RESTRICTION" | "INAPTE" | "NON_EVALUE";

export interface CertificatAptitudeData {
  // En-tête
  nom: string;
  prenom: string;
  ddn: string; // ISO ou déjà formatée
  rio: string;
  grade: string;
  specialite?: string | null;

  // Grille SIGYCOP
  s: number;
  i: number;
  g: number;
  y: number;
  c: number;
  o: number;
  p: number;

  // Tableau des aptitudes
  aptitudeGeneraleSPP: AptitudeStatus;
  aptitudeInitialeGES: AptitudeStatus;
  aptitudeMIR: AptitudeStatus;
  aptitudeGRIMP: AptitudeStatus;
  aptitudeNRBCe: AptitudeStatus;
  aptitudeGHSC: AptitudeStatus;
  conduiteGroupeLeger: AptitudeStatus;
  conduiteGroupeLourd: AptitudeStatus;
  opex: AptitudeStatus;
  contreIndicationEPMS: boolean;

  observations?: string | null;
  conclusion: string | null;
  lieu: string;
  dateCertificat: string;
  medecinNomComplet: string;
  medecinGrade: string;
}

interface CertificatAptitudeFormProps {
  type: CertificatType;
  data: CertificatAptitudeData;
  /** Passe le composant en mode formulaire éditable (défaut : lecture seule / impression). */
  editable?: boolean;
  onChange?: (data: CertificatAptitudeData) => void;
  /** Callback appelé lors de la soumission en mode éditable. */
  onSubmit?: (data: CertificatAptitudeData) => void;
}

const LIGNES_APTITUDES: { cle: keyof CertificatAptitudeData; label: string }[] = [
  { cle: "aptitudeGeneraleSPP", label: "Aptitude générale au service — SAPEURS-POMPIERS DE PARIS" },
  { cle: "aptitudeInitialeGES", label: "Aptitude initiale GES" },
  { cle: "aptitudeMIR", label: "Spécialité MIR" },
  { cle: "aptitudeGRIMP", label: "Spécialité GRIMP" },
  { cle: "aptitudeNRBCe", label: "Spécialité NRBCe" },
  { cle: "aptitudeGHSC", label: "Spécialité GHSC" },
  { cle: "conduiteGroupeLeger", label: "Conduite de véhicules du groupe léger" },
  { cle: "conduiteGroupeLourd", label: "Conduite de véhicules du groupe lourd" },
  { cle: "opex", label: "Opérations Extérieures (OPEX)" },
];

const SIGYCOP_LETTRES: { cle: "s" | "i" | "g" | "y" | "c" | "o" | "p"; label: string }[] = [
  { cle: "s", label: "S" },
  { cle: "i", label: "I" },
  { cle: "g", label: "G" },
  { cle: "y", label: "Y" },
  { cle: "c", label: "C" },
  { cle: "o", label: "O" },
  { cle: "p", label: "P" },
];

const TITRES: Record<CertificatType, string> = {
  ENGAGEMENT: "Certificat médical d'engagement",
  SUIVI: "Certificat de suivi des aptitudes",
};

function labelsConclusion(type: CertificatType): Record<string, string> {
  return type === "ENGAGEMENT" ? CONCLUSION_ENGAGEMENT_LABELS : CONCLUSION_SUIVI_LABELS;
}

function formatDateFr(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CertificatAptitudeForm({
  type,
  data,
  editable = false,
  onChange,
  onSubmit,
}: CertificatAptitudeFormProps) {
  const [local, setLocal] = useState<CertificatAptitudeData>(data);
  const labels = labelsConclusion(type);
  const conclusions = Object.keys(labels);

  function update<K extends keyof CertificatAptitudeData>(cle: K, valeur: CertificatAptitudeData[K]) {
    const suivant = { ...local, [cle]: valeur };
    setLocal(suivant);
    onChange?.(suivant);
  }

  const depasse = depasseSeuilInaptitude(local);

  return (
    <div className="mx-auto max-w-3xl">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {depasse && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 print:hidden">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Un ou plusieurs coefficients SIGYCOP dépassent les seuils d&apos;inaptitude réglementaires ({SIGYCOP_MENTION_LEGALE.replace("Au-delà de ces valeurs, inaptitude déclarée : ", "")}).</p>
        </div>
      )}

      <div className="mb-4 flex justify-end gap-2 print:hidden">
        {editable && onSubmit && (
          <button type="button" onClick={() => onSubmit(local)} className={bouton("primaire")}>
            <Save className="h-4 w-4" />
            Enregistrer le certificat
          </button>
        )}
        <button type="button" onClick={() => window.print()} className={bouton("secondaire")}>
          <Printer className="h-4 w-4" />
          Imprimer / PDF
        </button>
      </div>

      <div className="border border-slate-900 bg-white p-8 text-slate-900 print:border-black print:p-0">
        <header className="mb-4 border-b-2 border-slate-900 pb-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide">Service de Santé des Armées</p>
          <h1 className="mt-1 text-lg font-bold uppercase">{TITRES[type]}</h1>
        </header>

        {/* En-tête patient */}
        <section className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1 border border-slate-400 p-3 text-sm print:break-inside-avoid">
          <ChampLecture label="Nom" valeur={local.nom} />
          <ChampLecture label="Prénom" valeur={local.prenom} />
          <ChampLecture label="Date de naissance" valeur={formatDateFr(local.ddn)} />
          <ChampLecture label="Identifiant défense (RIO)" valeur={local.rio} />
          <ChampLecture label="Grade" valeur={local.grade} />
          <ChampLecture label="Spécialité" valeur={local.specialite || "—"} />
        </section>

        {/* Grille SIGYCOP */}
        <section className="mb-4 print:break-inside-avoid">
          <h2 className="mb-1 text-sm font-bold uppercase">Grille SIGYCOP</h2>
          <table className="w-full border-collapse border border-slate-900 text-center text-sm">
            <thead>
              <tr>
                {SIGYCOP_LETTRES.map(({ cle, label }) => (
                  <th key={cle} className="border border-slate-900 bg-slate-100 py-1 font-bold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {SIGYCOP_LETTRES.map(({ cle }) =>
                  editable ? (
                    <td key={cle} className="border border-slate-900 p-0">
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={local[cle]}
                        onChange={(e) => update(cle, Number(e.target.value) as never)}
                        className="w-full py-1 text-center outline-none"
                      />
                    </td>
                  ) : (
                    <td key={cle} className="border border-slate-900 py-1">
                      {local[cle]}
                    </td>
                  )
                )}
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-xs italic">{SIGYCOP_MENTION_LEGALE}</p>
        </section>

        {/* Tableau des aptitudes */}
        <section className="mb-4 print:break-inside-avoid">
          <h2 className="mb-1 text-sm font-bold uppercase">Aptitudes</h2>
          <table className="w-full border-collapse border border-slate-900 text-sm">
            <tbody>
              {LIGNES_APTITUDES.map(({ cle, label }) => (
                <tr key={cle}>
                  <td className="border border-slate-900 px-2 py-1">{label}</td>
                  <td className="w-48 border border-slate-900 px-2 py-1 text-center">
                    {editable ? (
                      <select
                        value={local[cle] as AptitudeStatus}
                        onChange={(e) => update(cle, e.target.value as never)}
                        className="w-full bg-transparent outline-none"
                      >
                        {(Object.keys(APTITUDE_STATUS_LABELS) as AptitudeStatus[]).map((valeur) => (
                          <option key={valeur} value={valeur}>
                            {APTITUDE_STATUS_LABELS[valeur]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      APTITUDE_STATUS_LABELS[local[cle] as AptitudeStatus]
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-900 px-2 py-1">
                  Contre-indication : pratique des épreuves de l&apos;entraînement physique
                  militaire et sportif (EPMS)
                </td>
                <td className="w-48 border border-slate-900 px-2 py-1 text-center">
                  {editable ? (
                    <input
                      type="checkbox"
                      checked={local.contreIndicationEPMS}
                      onChange={(e) => update("contreIndicationEPMS", e.target.checked)}
                    />
                  ) : local.contreIndicationEPMS ? (
                    "Oui"
                  ) : (
                    "Non"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Observations */}
        <section className="mb-4 print:break-inside-avoid">
          <h2 className="mb-1 text-sm font-bold uppercase">
            Observations ou restrictions éventuelles
          </h2>
          {editable ? (
            <textarea
              value={local.observations ?? ""}
              onChange={(e) => update("observations", e.target.value)}
              rows={3}
              className="w-full resize-none border border-slate-900 p-2 text-sm outline-none"
            />
          ) : (
            <div className="min-h-[3.5rem] whitespace-pre-wrap border border-slate-900 p-2 text-sm">
              {local.observations || "Néant"}
            </div>
          )}
        </section>

        {/* Conclusion */}
        <section className="mb-4 print:break-inside-avoid">
          <h2 className="mb-1 text-sm font-bold uppercase">Conclusion</h2>
          <div className="border border-slate-900 p-3 text-sm">
            {conclusions.map((valeur) => (
              <label key={valeur} className="mb-1 flex items-center gap-2 last:mb-0">
                <input
                  type="radio"
                  name="conclusion"
                  checked={local.conclusion === valeur}
                  disabled={!editable}
                  onChange={() => editable && update("conclusion", valeur)}
                />
                <span className={local.conclusion === valeur ? "font-semibold" : ""}>{labels[valeur]}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Lieu, date, signature */}
        <section className="mt-8 grid grid-cols-2 gap-6 text-sm print:break-inside-avoid">
          <div>
            <ChampLecture
              label="Fait à"
              valeur={local.lieu}
              editable={editable}
              onChange={(v) => update("lieu", v)}
            />
            <ChampLecture label="Le" valeur={formatDateFr(local.dateCertificat)} />
          </div>
          <div className="text-right">
            <p className="font-semibold">Signature et cachet du médecin</p>
            <p>{local.medecinGrade} {local.medecinNomComplet}</p>
            <div className="mt-8 h-16 border-b border-slate-900" />
          </div>
        </section>
      </div>
    </div>
  );
}

function ChampLecture({
  label,
  valeur,
  editable = false,
  onChange,
}: {
  label: string;
  valeur: string;
  editable?: boolean;
  onChange?: (valeur: string) => void;
}) {
  return (
    <p>
      <span className="font-semibold">{label} : </span>
      {editable ? (
        <input
          value={valeur}
          onChange={(e) => onChange?.(e.target.value)}
          className="border-b border-slate-400 bg-transparent outline-none"
        />
      ) : (
        <span>{valeur}</span>
      )}
    </p>
  );
}
