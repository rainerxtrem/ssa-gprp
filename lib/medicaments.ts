export interface MedicamentReference {
  nom: string;
  ligne: string;
}

export const BIBLIOTHEQUE_MEDICAMENTS: Record<string, MedicamentReference[]> = {
  "Antalgiques et AINS": [
    { nom: "Paracétamol", ligne: "Paracétamol, 1 g, 1 comprimé toutes les 6 heures si douleur ou fièvre, 5 jours, maximum 4 g/24 h" },
    { nom: "Ibuprofène", ligne: "Ibuprofène, 400 mg, 1 comprimé 3 fois/jour au cours des repas, 5 jours, maximum 1 200 mg/24 h" },
    { nom: "Kétoprofène", ligne: "Kétoprofène, 100 mg, 1 comprimé matin et soir, 5 jours, maximum 200 mg/24 h" },
    { nom: "Diclofénac", ligne: "Diclofénac, 50 mg, 1 comprimé 3 fois/jour, 5 jours, maximum 150 mg/24 h" },
    { nom: "Tramadol", ligne: "Tramadol, 50 mg, 1 comprimé toutes les 6 à 8 heures si douleur, 3 à 5 jours, maximum 400 mg/24 h" },
    { nom: "Codéine", ligne: "Codéine, 30 mg, 1 comprimé toutes les 6 heures si douleur, 3 à 5 jours, maximum 240 mg/24 h" },
    { nom: "Paracétamol/codéine", ligne: "Paracétamol/codéine, 500 mg/30 mg, 1 à 2 comprimés toutes les 6 heures si douleur, 3 à 5 jours, maximum 3 g de paracétamol/24 h" },
    { nom: "Néfopam", ligne: "Néfopam, 20 mg, 1 comprimé toutes les 6 à 8 heures si douleur, 3 à 5 jours, maximum 120 mg/24 h" },
    { nom: "Morphine LP", ligne: "Morphine LP, 10 mg, 1 comprimé matin et soir, durée selon douleur, maximum selon titration médicale" },
    { nom: "Tapentadol", ligne: "Tapentadol, 50 mg, 1 comprimé toutes les 8 heures si douleur, 5 jours, maximum 500 mg/24 h" },
    { nom: "Tilidine", ligne: "Tilidine, 50 mg, 1 comprimé 2 à 3 fois/jour si douleur, 5 jours, maximum 600 mg/24 h" },
    { nom: "Prégabaline", ligne: "Prégabaline, 75 mg, 1 capsule matin et soir, chronique, maximum 600 mg/24 h" },
    { nom: "Amitriptyline", ligne: "Amitriptyline, 10 mg, 1 comprimé le soir, douleurs neuropathiques, chronique, maximum 150 mg/24 h" },
    { nom: "Duloxétine", ligne: "Duloxétine, 30 mg, 1 gélule/jour, douleurs neuropathiques, chronique, maximum 120 mg/24 h" },
    { nom: "Tizanidine", ligne: "Tizanidine, 2 mg, 1 comprimé 2 à 3 fois/jour, contractures musculaires, 5 jours, maximum 24 mg/24 h" },
  ],
  "Antibiotiques": [
    { nom: "Amoxicilline", ligne: "Amoxicilline, 1 g, 1 comprimé 3 fois/jour, 7 jours, maximum 6 g/24 h" },
    { nom: "Amoxicilline/acide clavulanique", ligne: "Amoxicilline/acide clavulanique, 1 g/125 mg, 1 comprimé 3 fois/jour, 7 jours, maximum 3 prises/24 h" },
    { nom: "Azithromycine", ligne: "Azithromycine, 500 mg, 1 comprimé/jour, 3 jours, maximum 500 mg/24 h" },
    { nom: "Cefpodoxime", ligne: "Cefpodoxime, 200 mg, 1 comprimé matin et soir, 5 jours, maximum 400 mg/24 h" },
    { nom: "Cefixime", ligne: "Cefixime, 200 mg, 1 comprimé 2 fois/jour, 5 à 7 jours, maximum 400 mg/24 h" },
    { nom: "Levofloxacine", ligne: "Levofloxacine, 500 mg, 1 comprimé/jour, 5 jours, maximum 500 mg/24 h" },
    { nom: "Doxycycline", ligne: "Doxycycline, 100 mg, 1 comprimé 2 fois/jour, 7 à 10 jours, maximum 200 mg/24 h" },
    { nom: "Métronidazole", ligne: "Métronidazole, 500 mg, 1 comprimé 2 à 3 fois/jour, 7 jours, maximum 1 500 mg/24 h" },
    { nom: "Clindamycine", ligne: "Clindamycine, 300 mg, 1 gélule 3 fois/jour, 7 jours, maximum 1 800 mg/24 h" },
    { nom: "Fosfomycine", ligne: "Fosfomycine, 3 g, 1 sachet en prise unique, 1 jour, maximum 3 g/24 h" },
    { nom: "Fosfomycine trométamol", ligne: "Fosfomycine trométamol, 3 g, 1 sachet prise unique, 1 jour, maximum 3 g/24 h" },
  ],
  "Corticoïdes": [
    { nom: "Prednisone 20 mg", ligne: "Prednisone, 20 mg, 2 comprimés le matin, 5 jours, maximum 100 mg/24 h" },
    { nom: "Prednisone 5 mg", ligne: "Prednisone, 5 mg, 4 comprimés le matin, 5 jours, maximum 60 mg/24 h" },
    { nom: "Prednisolone 20 mg", ligne: "Prednisolone, 20 mg, 2 comprimés le matin, 5 jours, maximum 100 mg/24 h" },
    { nom: "Prednisolone variable", ligne: "Prednisolone, 20 mg, 1 à 3 comprimés le matin, 5 jours, maximum 100 mg/24 h" },
    { nom: "Dexaméthasone", ligne: "Dexaméthasone, 4 mg, 1 comprimé/jour, 1 à 3 jours, maximum 10 mg/24 h" },
    { nom: "Betaméthasone", ligne: "Betaméthasone, 2 mg, 1 comprimé/jour, 1 à 5 jours, maximum 8 mg/24 h" },
  ],
  "Respiratoire": [
    { nom: "Salbutamol", ligne: "Salbutamol, 100 µg/dose, 1 à 2 bouffées si besoin, 7 jours, maximum 8 bouffées/24 h" },
    { nom: "Budesonide", ligne: "Budesonide, 200 µg/dose, 2 inhalations matin et soir, 30 jours, maximum 800 µg/24 h" },
    { nom: "Budésonide/formotérol", ligne: "Budésonide/formotérol, 200/6 µg, 2 inhalations matin et soir, 30 jours, maximum 8 inhalations/24 h" },
    { nom: "Tiotropium", ligne: "Tiotropium, 18 µg, 1 inhalation/jour, traitement chronique, maximum 1/24 h" },
    { nom: "Fluticasone inhalée", ligne: "Fluticasone inhalée, 125 µg, 2 inhalations matin et soir, 30 jours, maximum 1000 µg/24 h" },
    { nom: "Acétylcystéine", ligne: "Acétylcystéine, 200 mg, 1 sachet 3 fois/jour, 5 jours, maximum 600 mg/24 h" },
    { nom: "Ambroxol", ligne: "Ambroxol, 30 mg, 1 comprimé 3 fois/jour, 5 jours, maximum 90 mg/24 h" },
    { nom: "Budesonide nasal", ligne: "Budesonide nasal, 64 µg/dose, 1 pulvérisation par narine 2 fois/jour, 14 jours, maximum 256 µg/24 h" },
    { nom: "Mometasone nasal", ligne: "Mometasone nasal, 50 µg/dose, 2 pulvérisations/jour, 14 jours, maximum 200 µg/24 h" },
    { nom: "Ipratropium nasal", ligne: "Ipratropium nasal, 0,03 %, 2 pulvérisations 3 fois/jour, 5 jours, maximum 12 pulvérisations/24 h" },
    { nom: "Montelukast", ligne: "Montelukast, 10 mg, 1 comprimé le soir, asthme/allergie, chronique, maximum 10 mg/24 h" },
    { nom: "Theophylline LP", ligne: "Theophylline LP, 200 mg, 1 comprimé 2 fois/jour, chronique, maximum 800 mg/24 h" },
  ],
  "Allergie": [
    { nom: "Loratadine", ligne: "Loratadine, 10 mg, 1 comprimé/jour, 15 jours, maximum 10 mg/24 h" },
    { nom: "Cétirizine", ligne: "Cétirizine, 10 mg, 1 comprimé le soir, 15 jours, maximum 10 mg/24 h" },
    { nom: "Bilastine", ligne: "Bilastine, 20 mg, 1 comprimé/jour à jeun, 15 jours, maximum 20 mg/24 h" },
    { nom: "Desloratadine", ligne: "Desloratadine, 5 mg, 1 comprimé/jour, 15 jours, maximum 5 mg/24 h" },
    { nom: "Fexofenadine", ligne: "Fexofenadine, 120 mg, 1 comprimé/jour, 15 jours, maximum 120 mg/24 h" },
    { nom: "Olopatadine collyre", ligne: "Olopatadine collyre, 1 goutte 2 fois/jour, conjonctivite allergique, 10 jours, maximum 2 instillations/24 h" },
    { nom: "Kétotifène collyre", ligne: "Kétotifène collyre, 1 goutte 2 fois/jour, allergie oculaire, 10 jours, maximum 2 instillations/24 h" },
  ],
  "Digestif": [
    { nom: "Oméprazole", ligne: "Oméprazole, 20 mg, 1 gélule le matin à jeun, 28 jours, maximum 40 mg/24 h" },
    { nom: "Esoméprazole", ligne: "Esoméprazole, 40 mg, 1 comprimé/jour, 14 à 28 jours, maximum 40 mg/24 h" },
    { nom: "Pantoprazole", ligne: "Pantoprazole, 40 mg, 1 comprimé/jour, 14 jours, maximum 40 mg/24 h" },
    { nom: "Gaviscon", ligne: "Gaviscon, suspension, 10 à 20 mL après repas et au coucher, 7 à 14 jours, maximum 80 mL/24 h" },
    { nom: "Métoclopramide", ligne: "Métoclopramide, 10 mg, 1 comprimé jusqu'à 3 fois/jour, 5 jours, maximum 30 mg/24 h" },
    { nom: "Dompéridone", ligne: "Dompéridone, 10 mg, 1 comprimé jusqu'à 3 fois/jour, 7 jours, maximum 30 mg/24 h" },
    { nom: "Macrogol", ligne: "Macrogol, 10 g, 1 à 2 sachets/jour, 15 jours, maximum 4 sachets/24 h" },
    { nom: "Lactulose", ligne: "Lactulose, 10 g/15 mL, 15 mL matin et soir, 15 jours, maximum 90 mL/24 h" },
    { nom: "Lopéramide", ligne: "Lopéramide, 2 mg, 1 gélule après chaque selle liquide, 2 jours, maximum 16 mg/24 h" },
    { nom: "Diosmectite", ligne: "Diosmectite, 3 g, 1 sachet 3 fois/jour, 5 jours, maximum 9 g/24 h" },
    { nom: "Trimébutine", ligne: "Trimébutine, 100 mg, 1 comprimé 3 fois/jour, douleurs abdominales, 5 jours, maximum 300 mg/24 h" },
    { nom: "Dicyclomine", ligne: "Dicyclomine, 20 mg, 1 comprimé 3 fois/jour, spasmes digestifs, 5 jours, maximum 80 mg/24 h" },
    { nom: "Siméthicone", ligne: "Siméthicone, 125 mg, 1 comprimé après repas et coucher, 5 jours, maximum 500 mg/24 h" },
    { nom: "Charbon activé", ligne: "Charbon activé, 500 mg, 2 capsules 2 à 3 fois/jour, 3 jours, maximum 6 g/24 h" },
    { nom: "Phloroglucinol", ligne: "Phloroglucinol, 80 mg, 2 comprimés si douleur jusqu'à 3 fois/jour, 5 jours, maximum 480 mg/24 h" },
  ],
  "Cardiovasculaire": [
    { nom: "Amlodipine", ligne: "Amlodipine, 5 mg, 1 comprimé/jour, traitement chronique, maximum 10 mg/24 h" },
    { nom: "Bisoprolol", ligne: "Bisoprolol, 5 mg, 1 comprimé/jour, traitement chronique, maximum 10 mg/24 h" },
    { nom: "Ramipril", ligne: "Ramipril, 5 mg, 1 comprimé/jour, traitement chronique, maximum 10 mg/24 h" },
    { nom: "Perindopril", ligne: "Perindopril, 5 mg, 1 comprimé/jour, traitement chronique, maximum 10 mg/24 h" },
    { nom: "Furosémide", ligne: "Furosémide, 40 mg, 1 comprimé le matin, selon poids/œdèmes, maximum 120 mg/24 h" },
    { nom: "Spironolactone", ligne: "Spironolactone, 25 mg, 1 comprimé/jour, traitement chronique, maximum 100 mg/24 h" },
  ],
  "Neurologie et psychiatrie": [
    { nom: "Sertraline", ligne: "Sertraline, 50 mg, 1 comprimé/jour, chronique, maximum 200 mg/24 h" },
    { nom: "Escitalopram", ligne: "Escitalopram, 10 mg, 1 comprimé/jour, chronique, maximum 20 mg/24 h" },
    { nom: "Hydroxyzine", ligne: "Hydroxyzine, 25 mg, 1 comprimé le soir, 7 à 15 jours, maximum 100 mg/24 h" },
    { nom: "Alprazolam", ligne: "Alprazolam, 0,25 mg, 1 comprimé jusqu'à 3 fois/jour, court terme, maximum 4 mg/24 h" },
    { nom: "Sumatriptan", ligne: "Sumatriptan, 50 mg, 1 comprimé au début de la crise, si besoin renouvelable après 2h, 1 à 3 jours, maximum 300 mg/24 h" },
    { nom: "Zolmitriptan", ligne: "Zolmitriptan, 2,5 mg, 1 comprimé au début de la crise, 1 à 3 jours, maximum 10 mg/24 h" },
    { nom: "Gabapentine", ligne: "Gabapentine, 300 mg, 1 gélule 1 à 3 fois/jour, chronique, maximum 3600 mg/24 h" },
    { nom: "Lévétiracétam", ligne: "Lévétiracétam, 500 mg, 1 comprimé 2 fois/jour, chronique, maximum 3000 mg/24 h" },
  ],
  "Infectieux cutané / antiviral / dermatologie": [
    { nom: "Aciclovir", ligne: "Aciclovir, 200 mg, 1 comprimé 5 fois/jour, 5 jours, maximum 1 000 mg/24 h" },
    { nom: "Valaciclovir", ligne: "Valaciclovir, 500 mg, 1 comprimé matin et soir, 5 jours, maximum 3 g/24 h" },
    { nom: "Mupirocine", ligne: "Mupirocine, pommade 2 %, application 3 fois/jour, 7 jours, maximum 3 applications/24 h" },
    { nom: "Acide fusidique", ligne: "Acide fusidique, crème 2 %, application 2 à 3 fois/jour, 7 jours, maximum 3 applications/24 h" },
    { nom: "Permethrine 5%", ligne: "Permethrine 5 %, crème, application unique puis J7, gale, maximum 1 application/24 h" },
    { nom: "Adapalene", ligne: "Adapalene gel 0,1 %, application le soir, acné, chronique, maximum 1 application/24 h" },
    { nom: "Peroxyde de benzoyle", ligne: "Peroxyde de benzoyle 5 %, application 1 fois/jour, acné, chronique, maximum 1 application/24 h" },
    { nom: "Tacrolimus pommade", ligne: "Tacrolimus pommade 0,1 %, application 2 fois/jour, eczéma, chronique, maximum 2 applications/24 h" },
    { nom: "Acide azelaique", ligne: "Acide azélaïque 20 %, application 2 fois/jour, rosacée/acné, chronique, maximum 2 applications/24 h" },
  ],
  "Urologie": [
    { nom: "Tamsulosine", ligne: "Tamsulosine, 0,4 mg, 1 gélule/jour, chronique, maximum 0,4 mg/24 h" },
    { nom: "Oxybutynine", ligne: "Oxybutynine, 5 mg, 1 comprimé 2 à 3 fois/jour, chronique, maximum 15 mg/24 h" },
    { nom: "Nitrofurantoine", ligne: "Nitrofurantoïne, 100 mg, 1 comprimé 2 fois/jour, cystite, 5 jours, maximum 200 mg/24 h" },
    { nom: "Phenazopyridine", ligne: "Phénazopyridine, 200 mg, 1 comprimé 3 fois/jour, brûlures urinaires, 2 jours, maximum 600 mg/24 h" },
    { nom: "Norfloxacine", ligne: "Norfloxacine, 400 mg, 1 comprimé 2 fois/jour, IU, 5 jours, maximum 800 mg/24 h" },
  ],
  "Diabète": [
    { nom: "Metformine", ligne: "Metformine, 500 mg, 1 comprimé 2 à 3 fois/jour, chronique, maximum 3 g/24 h" },
    { nom: "Gliclazide", ligne: "Gliclazide, 60 mg, 1 comprimé le matin, chronique, maximum 120 mg/24 h" },
    { nom: "Insuline rapide (humaine)", ligne: "Insuline rapide (humaine), dose variable, avant repas, chronique, maximum selon glycémie" },
  ],
  "Prévention et compléments": [
    { nom: "Acide folique", ligne: "Acide folique, 0,4 mg, 1 comprimé/jour, prévention, maximum 5 mg/24 h" },
    { nom: "Vitamine D3", ligne: "Vitamine D3, 100 000 UI, 1 prise toutes les 1 à 3 mois, prévention, maximum selon protocole" },
    { nom: "Fer oral", ligne: "Fer oral, 80 mg, 1 comprimé/jour, 1 à 3 mois, maximum 200 mg/j fer élément" },
    { nom: "Melatonine", ligne: "Mélatonine, 2 mg, 1 comprimé le soir, troubles du sommeil, 10 jours, maximum 10 mg/24 h" },
    { nom: "Zinc", ligne: "Zinc, 15 mg, 1 comprimé/jour, 15 jours, maximum 30 mg/24 h" },
    { nom: "Vitamine C", ligne: "Vitamine C, 1 g, 1 comprimé/jour, 10 jours, maximum 1 g/24 h" },
    { nom: "Magnésium", ligne: "Magnésium, 300 mg, 1 comprimé/jour, 30 jours, maximum 600 mg/24 h" },
    { nom: "Lactase", ligne: "Lactase, 10 000 UI, 1 comprimé avant repas, intolérance lactose, à la demande, maximum 30 000 UI/24 h" },
  ],
};

export interface LigneMedicamentAnalysee {
  nom: string;
  dosage: string;
  posologie: string;
  duree: string;
}

/** Convertit une ligne "Nom, dosage, posologie, durée, maximum ..." de la bibliothèque en champs d'ordonnance. */
export function analyserLigneMedicament(nom: string, ligne: string): LigneMedicamentAnalysee {
  const parties = ligne.split(", ");
  if (parties.length < 4) {
    return { nom, dosage: "", posologie: ligne, duree: "" };
  }
  const [, dosage, posologie, duree, ...reste] = parties;
  const maximum = reste.join(", ");
  return {
    nom,
    dosage,
    posologie: maximum ? `${posologie} (${maximum})` : posologie,
    duree,
  };
}
