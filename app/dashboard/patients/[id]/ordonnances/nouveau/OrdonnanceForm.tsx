"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, FieldTextarea } from "@/components/ui/Field";
import { bouton, champClasses, labelClasses } from "@/lib/ui";
import { BIBLIOTHEQUE_MEDICAMENTS, analyserLigneMedicament } from "@/lib/medicaments";
import { detecterInteractions } from "@/lib/interactions";

export interface LigneMedicament {
  nom: string;
  dosage: string;
  forme: string;
  posologie: string;
  duree: string;
}

const LIGNE_VIDE: LigneMedicament = { nom: "", dosage: "", forme: "", posologie: "", duree: "" };

export interface OrdonnanceValeurs {
  medicaments: LigneMedicament[];
  instructions: string;
  lieu: string;
}

export default function OrdonnanceForm({
  patientId,
  mode = "creer",
  prescriptionId,
  valeursInitiales,
}: {
  patientId: string;
  mode?: "creer" | "modifier";
  prescriptionId?: string;
  valeursInitiales?: OrdonnanceValeurs;
}) {
  const router = useRouter();
  const [medicaments, setMedicaments] = useState<LigneMedicament[]>(
    valeursInitiales?.medicaments && valeursInitiales.medicaments.length > 0
      ? valeursInitiales.medicaments
      : [{ ...LIGNE_VIDE }]
  );
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const alertesInteraction = useMemo(
    () => detecterInteractions(medicaments.map((m) => m.nom.trim()).filter(Boolean)),
    [medicaments]
  );

  function majLigne(index: number, champ: keyof LigneMedicament, valeur: string) {
    setMedicaments((lignes) => lignes.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)));
  }

  function appliquerReferenceBibliotheque(index: number, cle: string) {
    if (!cle) return;
    const [categorie, nom] = cle.split("::");
    const reference = BIBLIOTHEQUE_MEDICAMENTS[categorie]?.find((m) => m.nom === nom);
    if (!reference) return;
    const analyse = analyserLigneMedicament(reference.nom, reference.ligne);
    setMedicaments((lignes) =>
      lignes.map((l, i) =>
        i === index
          ? { ...l, nom: analyse.nom, dosage: analyse.dosage, posologie: analyse.posologie, duree: analyse.duree }
          : l
      )
    );
  }

  function ajouterLigne() {
    setMedicaments((lignes) => [...lignes, { ...LIGNE_VIDE }]);
  }

  function supprimerLigne(index: number) {
    setMedicaments((lignes) => lignes.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);

    const lignesValides = medicaments.filter((l) => l.nom.trim() && l.posologie.trim() && l.duree.trim());
    if (lignesValides.length === 0) {
      setErreur("Ajoutez au moins un médicament avec nom, posologie et durée.");
      return;
    }

    setEnCours(true);
    const form = new FormData(e.currentTarget);

    const url = mode === "creer" ? "/api/prescriptions" : `/api/prescriptions/${prescriptionId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(mode === "creer" ? { patientId } : {}),
        medicaments: lignesValides,
        instructions: form.get("instructions") || undefined,
        lieu: form.get("lieu"),
      }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.error ?? "Erreur lors de l'enregistrement de l'ordonnance.");
      return;
    }

    if (mode === "creer") {
      router.push(`/dashboard/patients/${patientId}?onglet=suivi`);
    } else {
      router.push(`/dashboard/patients/${patientId}/ordonnances/${prescriptionId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {alertesInteraction.length > 0 && (
        <div className="space-y-2">
          {alertesInteraction.map((a, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                a.niveau === "danger"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                <span className="font-medium">{a.medicaments[0]} + {a.medicaments[1]} : </span>
                {a.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Médicaments"
          action={
            <button type="button" onClick={ajouterLigne} className={bouton("secondaire", "sm")}>
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </button>
          }
        />
        <CardBody className="space-y-4">
          {medicaments.map((ligne, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Médicament {index + 1}</p>
                {medicaments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => supprimerLigne(index)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Supprimer cette ligne"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-3">
                <span className={labelClasses}>Choisir dans la bibliothèque</span>
                <select
                  defaultValue=""
                  onChange={(e) => appliquerReferenceBibliotheque(index, e.target.value)}
                  className={champClasses}
                >
                  <option value="">Personnalisé (saisie manuelle)</option>
                  {Object.entries(BIBLIOTHEQUE_MEDICAMENTS).map(([categorie, medicaments]) => (
                    <optgroup key={categorie} label={categorie}>
                      {medicaments.map((m) => (
                        <option key={`${categorie}::${m.nom}`} value={`${categorie}::${m.nom}`}>
                          {m.nom}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <span className={labelClasses}>Nom *</span>
                  <input
                    value={ligne.nom}
                    onChange={(e) => majLigne(index, "nom", e.target.value)}
                    className={champClasses}
                    required
                  />
                </div>
                <div>
                  <span className={labelClasses}>Dosage</span>
                  <input
                    value={ligne.dosage}
                    onChange={(e) => majLigne(index, "dosage", e.target.value)}
                    className={champClasses}
                  />
                </div>
                <div>
                  <span className={labelClasses}>Forme</span>
                  <input
                    value={ligne.forme}
                    onChange={(e) => majLigne(index, "forme", e.target.value)}
                    className={champClasses}
                    placeholder="comprimé, gélule..."
                  />
                </div>
                <div>
                  <span className={labelClasses}>Durée *</span>
                  <input
                    value={ligne.duree}
                    onChange={(e) => majLigne(index, "duree", e.target.value)}
                    className={champClasses}
                    placeholder="5 jours"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <span className={labelClasses}>Posologie *</span>
                  <input
                    value={ligne.posologie}
                    onChange={(e) => majLigne(index, "posologie", e.target.value)}
                    className={champClasses}
                    placeholder="1 comprimé matin et soir"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Signature" />
        <CardBody className="space-y-4">
          <FieldTextarea label="Instructions complémentaires" name="instructions" rows={2} defaultValue={valeursInitiales?.instructions} />
          <Field label="Fait à" name="lieu" required className="max-w-xs" defaultValue={valeursInitiales?.lieu} />
        </CardBody>
      </Card>

      {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours} className={bouton("primaire")}>
          {enCours ? "Génération..." : mode === "creer" ? "Générer l'ordonnance" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
