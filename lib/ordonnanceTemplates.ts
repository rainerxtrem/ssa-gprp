import { analyserLigneMedicament, BIBLIOTHEQUE_MEDICAMENTS } from "@/lib/medicaments";

export interface LigneProtocole {
  nom: string;
  dosage: string;
  forme: string;
  posologie: string;
  duree: string;
}

export interface ProtocoleOrdonnance {
  nom: string;
  /** Noms de lib/medicaments.ts à reprendre tels quels dans ce protocole. */
  medicaments: string[];
}

const PROTOCOLES_SOURCE: ProtocoleOrdonnance[] = [
  { nom: "Angine bactérienne", medicaments: ["Amoxicilline", "Paracétamol"] },
  { nom: "Entorse", medicaments: ["Ibuprofène", "Paracétamol"] },
  { nom: "Rhinopharyngite", medicaments: ["Paracétamol"] },
  { nom: "Lombalgie", medicaments: ["Ibuprofène", "Paracétamol", "Tizanidine"] },
  { nom: "Gastro-entérite", medicaments: ["Diosmectite", "Lopéramide"] },
  { nom: "Migraine", medicaments: ["Sumatriptan", "Paracétamol"] },
];

function trouverReference(nom: string) {
  for (const lignes of Object.values(BIBLIOTHEQUE_MEDICAMENTS)) {
    const trouve = lignes.find((m) => m.nom === nom);
    if (trouve) return trouve;
  }
  return null;
}

/** Résout chaque protocole vers des lignes de médicaments prêtes à insérer dans une ordonnance. */
export function resoudreProtocoles(): { nom: string; lignes: LigneProtocole[] }[] {
  return PROTOCOLES_SOURCE.map((protocole) => ({
    nom: protocole.nom,
    lignes: protocole.medicaments
      .map((nomMedicament) => {
        const reference = trouverReference(nomMedicament);
        if (!reference) return null;
        const analyse = analyserLigneMedicament(reference.nom, reference.ligne);
        return { nom: analyse.nom, dosage: analyse.dosage, forme: "", posologie: analyse.posologie, duree: analyse.duree };
      })
      .filter((l): l is LigneProtocole => l !== null),
  }));
}
