export type NiveauInteraction = "attention" | "danger";

export interface InteractionMedicamenteuse {
  a: string[];
  b: string[];
  niveau: NiveauInteraction;
  message: string;
}

/**
 * Base d'alertes basiques, volontairement limitée aux médicaments de
 * lib/medicaments.ts. Ce n'est pas une base d'interactions exhaustive ni un
 * dispositif médical certifié — seulement un signal d'alerte pour le médecin,
 * qui reste seul décisionnaire.
 */
export const INTERACTIONS_MEDICAMENTEUSES: InteractionMedicamenteuse[] = [
  {
    a: ["Ibuprofène", "Kétoprofène", "Diclofénac"],
    b: ["Ibuprofène", "Kétoprofène", "Diclofénac"],
    niveau: "attention",
    message: "Association de deux AINS : risque digestif et rénal accru, à éviter sauf avis spécialisé.",
  },
  {
    a: ["Ibuprofène", "Kétoprofène", "Diclofénac"],
    b: ["Ramipril", "Perindopril"],
    niveau: "attention",
    message: "AINS + IEC : risque d'insuffisance rénale aiguë, surveiller la fonction rénale.",
  },
  {
    a: ["Ibuprofène", "Kétoprofène", "Diclofénac"],
    b: ["Spironolactone"],
    niveau: "attention",
    message: "AINS + Spironolactone : risque d'hyperkaliémie.",
  },
  {
    a: ["Ramipril", "Perindopril"],
    b: ["Spironolactone"],
    niveau: "danger",
    message: "IEC + Spironolactone : risque d'hyperkaliémie sévère, surveillance biologique nécessaire.",
  },
  {
    a: ["Tramadol", "Tapentadol", "Tilidine"],
    b: ["Sertraline", "Escitalopram", "Duloxétine"],
    niveau: "danger",
    message: "Opioïde + antidépresseur sérotoninergique : risque de syndrome sérotoninergique.",
  },
  {
    a: ["Sumatriptan", "Zolmitriptan"],
    b: ["Sertraline", "Escitalopram", "Duloxétine"],
    niveau: "danger",
    message: "Triptan + antidépresseur sérotoninergique : risque de syndrome sérotoninergique.",
  },
  {
    a: ["Tramadol", "Codéine", "Paracétamol/codéine", "Morphine LP", "Tapentadol", "Tilidine"],
    b: ["Alprazolam", "Hydroxyzine"],
    niveau: "danger",
    message: "Opioïde + sédatif : risque de dépression respiratoire, association à éviter ou surveiller étroitement.",
  },
  {
    a: ["Azithromycine", "Levofloxacine", "Norfloxacine"],
    b: ["Dompéridone"],
    niveau: "attention",
    message: "Antibiotique + Dompéridone : risque d'allongement du QT.",
  },
  {
    a: ["Fluticasone inhalée", "Prednisone 20 mg", "Prednisone 5 mg", "Prednisolone 20 mg", "Prednisolone variable", "Dexaméthasone", "Betaméthasone"],
    b: ["Metformine", "Gliclazide"],
    niveau: "attention",
    message: "Corticoïde + antidiabétique : risque de déséquilibre glycémique, adapter la surveillance.",
  },
  {
    a: ["Doxycycline"],
    b: ["Fer oral"],
    niveau: "attention",
    message: "Le fer oral réduit l'absorption des cyclines : espacer les prises de 2 à 3 heures.",
  },
];

export interface AlerteInteraction {
  niveau: NiveauInteraction;
  message: string;
  medicaments: [string, string];
}

/** Détecte les interactions basiques entre une liste de noms de médicaments. */
export function detecterInteractions(nomsMedicaments: string[]): AlerteInteraction[] {
  const alertes: AlerteInteraction[] = [];

  for (let i = 0; i < nomsMedicaments.length; i++) {
    for (let j = i + 1; j < nomsMedicaments.length; j++) {
      const nomA = nomsMedicaments[i];
      const nomB = nomsMedicaments[j];
      if (!nomA || !nomB || nomA === nomB) continue;

      for (const regle of INTERACTIONS_MEDICAMENTEUSES) {
        const matchDirect = regle.a.includes(nomA) && regle.b.includes(nomB);
        const matchInverse = regle.a.includes(nomB) && regle.b.includes(nomA);
        if (matchDirect || matchInverse) {
          alertes.push({ niveau: regle.niveau, message: regle.message, medicaments: [nomA, nomB] });
        }
      }
    }
  }

  return alertes;
}
