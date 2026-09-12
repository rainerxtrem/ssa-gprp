import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  MEDECIN_CHEF: "Médecin chef (Colonel / LCL)",
  MEDECIN_PRINCIPAL: "Médecin principal (Commandant)",
  MEDECIN_ARMES: "Médecin des armées (Capitaine)",
  INTERNE_MEDECINE: "Interne en médecine (Lieutenant)",
  EXTERNE_MEDECINE: "Externe en médecine (Sous-Lieutenant)",
  CADRE_SANTE: "Cadre de santé (Lieutenant)",
  INFIRMIER_MAJOR: "Infirmier major (Major)",
  INFIRMIER_ANESTHESISTE: "Infirmier anesthésiste (Adjudant-Chef)",
  INFIRMIER: "Infirmier (Adjudant)",
  ETUDIANT_INFIRMIER: "Étudiant infirmier (Sergent)",
  COMMANDEMENT: "Commandement (accès restreint)",
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
