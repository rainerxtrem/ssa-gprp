"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { bouton, champClasses, labelClasses } from "@/lib/ui";
import { MODELES_CONSULTATION, MODELES_SUIVI_INFIRMIER } from "@/lib/consultationTemplates";
import { ShieldAlert } from "lucide-react";

export interface ConsultationValeurs {
  motif: string;
  anamnese: string;
  examenClinique: string;
  temperature: string;
  tensionSystolique: string;
  tensionDiastolique: string;
  frequenceCardiaque: string;
  saturationO2: string;
  poids: string;
  taille: string;
  diagnostic: string;
  conduiteATenir: string;
}

const VALEURS_VIDES: ConsultationValeurs = {
  motif: "",
  anamnese: "",
  examenClinique: "",
  temperature: "",
  tensionSystolique: "",
  tensionDiastolique: "",
  frequenceCardiaque: "",
  saturationO2: "",
  poids: "",
  taille: "",
  diagnostic: "",
  conduiteATenir: "",
};

export default function ConsultationForm({
  patientId,
  mode = "creer",
  consultationId,
  valeursInitiales,
  forcerSuiviInfirmier = false,
}: {
  patientId: string;
  mode?: "creer" | "modifier";
  consultationId?: string;
  valeursInitiales?: ConsultationValeurs;
  /** Un paramédical ne peut créer/modifier qu'une consultation de suivi infirmier. */
  forcerSuiviInfirmier?: boolean;
}) {
  const router = useRouter();
  const [champs, setChamps] = useState<ConsultationValeurs>(valeursInitiales ?? VALEURS_VIDES);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const modeles = forcerSuiviInfirmier ? MODELES_SUIVI_INFIRMIER : MODELES_CONSULTATION;

  function maj(champ: keyof ConsultationValeurs, valeur: string) {
    setChamps((c) => ({ ...c, [champ]: valeur }));
  }

  function appliquerModele(indexStr: string) {
    if (indexStr === "") return;
    const modele = modeles[Number(indexStr)];
    if (!modele) return;
    setChamps((c) => ({
      ...c,
      motif: modele.motif,
      anamnese: modele.anamnese ?? "",
      examenClinique: modele.examenClinique ?? "",
      diagnostic: modele.diagnostic ?? "",
      conduiteATenir: modele.conduiteATenir ?? "",
    }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const form = new FormData(e.currentTarget);
    const nombreOuUndefined = (key: string) => {
      const v = form.get(key);
      return v && String(v).trim() !== "" ? Number(v) : undefined;
    };

    const payload = {
      ...(mode === "creer" ? { patientId } : {}),
      ...(forcerSuiviInfirmier ? { type: "SUIVI_INFIRMIER" as const } : {}),
      motif: champs.motif,
      anamnese: champs.anamnese || undefined,
      examenClinique: champs.examenClinique || undefined,
      temperature: nombreOuUndefined("temperature"),
      tensionSystolique: nombreOuUndefined("tensionSystolique"),
      tensionDiastolique: nombreOuUndefined("tensionDiastolique"),
      frequenceCardiaque: nombreOuUndefined("frequenceCardiaque"),
      saturationO2: nombreOuUndefined("saturationO2"),
      poids: nombreOuUndefined("poids"),
      taille: nombreOuUndefined("taille"),
      diagnostic: champs.diagnostic || undefined,
      conduiteATenir: champs.conduiteATenir || undefined,
    };

    const url = mode === "creer" ? "/api/consultations" : `/api/consultations/${consultationId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement de la consultation.");
      return;
    }

    if (mode === "creer") {
      router.push(`/dashboard/patients/${patientId}?onglet=suivi`);
    } else {
      router.push(`/dashboard/patients/${patientId}/consultations/${consultationId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {forcerSuiviInfirmier && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Suivi infirmier autonome : pour un problème de santé courant ou une pathologie chronique déjà connue.
            En cas de suspicion d&apos;inaptitude, ne concluez pas ici — utilisez « Signaler une suspicion
            d&apos;inaptitude » depuis le dossier patient pour qu&apos;un médecin homologue la décision.
          </p>
        </div>
      )}

      {mode === "creer" && (
        <Card>
          <CardBody>
            <span className={labelClasses}>Modèle de consultation (facultatif)</span>
            <select defaultValue="" onChange={(e) => appliquerModele(e.target.value)} className={champClasses}>
              <option value="">Aucun — saisie libre</option>
              {modeles.map((m, i) => (
                <option key={m.motif} value={i}>
                  {m.motif}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">Pré-remplit les champs ci-dessous, tous restent modifiables.</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Motif et anamnèse" />
        <CardBody className="space-y-4">
          <Field label="Motif de consultation" name="motif" required value={champs.motif} onChange={(e) => maj("motif", e.target.value)} />
          <FieldTextarea label="Anamnèse" name="anamnese" rows={3} value={champs.anamnese} onChange={(e) => maj("anamnese", e.target.value)} />
          <FieldTextarea
            label="Examen clinique"
            name="examenClinique"
            rows={3}
            value={champs.examenClinique}
            onChange={(e) => maj("examenClinique", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Constantes" description="Facultatif — laisser vide si non mesuré" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Température (°C)" name="temperature" type="number" defaultValue={champs.temperature} />
          <Field label="Tension systolique" name="tensionSystolique" type="number" defaultValue={champs.tensionSystolique} />
          <Field label="Tension diastolique" name="tensionDiastolique" type="number" defaultValue={champs.tensionDiastolique} />
          <Field label="Fréquence cardiaque" name="frequenceCardiaque" type="number" defaultValue={champs.frequenceCardiaque} />
          <Field label="Saturation O2 (%)" name="saturationO2" type="number" defaultValue={champs.saturationO2} />
          <Field label="Poids (kg)" name="poids" type="number" defaultValue={champs.poids} />
          <Field label="Taille (cm)" name="taille" type="number" defaultValue={champs.taille} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Conclusion" />
        <CardBody className="space-y-4">
          <FieldTextarea
            label={forcerSuiviInfirmier ? "Observations d'évolution" : "Diagnostic"}
            name="diagnostic"
            rows={3}
            value={champs.diagnostic}
            onChange={(e) => maj("diagnostic", e.target.value)}
          />
          <FieldTextarea
            label="Conduite à tenir"
            name="conduiteATenir"
            rows={3}
            value={champs.conduiteATenir}
            onChange={(e) => maj("conduiteATenir", e.target.value)}
          />
        </CardBody>
      </Card>

      {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours} className={bouton("primaire")}>
          {enCours ? "Enregistrement..." : mode === "creer" ? "Enregistrer la consultation" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
