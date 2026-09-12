import { prisma } from "@/lib/prisma";

export type ActionAudit =
  | "PATIENT_CREE"
  | "PATIENT_MODIFIE"
  | "CONSULTATION_CREEE"
  | "CONSULTATION_MODIFIEE"
  | "CONSULTATION_ANNULEE"
  | "ORDONNANCE_CREEE"
  | "ORDONNANCE_MODIFIEE"
  | "ORDONNANCE_ANNULEE"
  | "CERTIFICAT_CREE"
  | "CERTIFICAT_MODIFIE"
  | "CERTIFICAT_ANNULE"
  | "ARRET_CREE"
  | "CONVOCATION_CREEE"
  | "CONVOCATION_MODIFIEE";

export const LIBELLES_ACTION_AUDIT: Record<ActionAudit, string> = {
  PATIENT_CREE: "Dossier patient créé",
  PATIENT_MODIFIE: "Dossier patient modifié",
  CONSULTATION_CREEE: "Consultation créée",
  CONSULTATION_MODIFIEE: "Consultation modifiée",
  CONSULTATION_ANNULEE: "Consultation annulée",
  ORDONNANCE_CREEE: "Ordonnance créée",
  ORDONNANCE_MODIFIEE: "Ordonnance modifiée",
  ORDONNANCE_ANNULEE: "Ordonnance annulée",
  CERTIFICAT_CREE: "Certificat créé",
  CERTIFICAT_MODIFIE: "Certificat modifié",
  CERTIFICAT_ANNULE: "Certificat annulé",
  ARRET_CREE: "Arrêt / exemption créé",
  CONVOCATION_CREEE: "Convocation créée",
  CONVOCATION_MODIFIEE: "Convocation modifiée",
};

/**
 * Enregistre une entrée dans le journal d'audit du dossier patient.
 * `details` doit rester un résumé non sensible (jamais de diagnostic, de motif
 * médical ou d'ordonnance en clair) — c'est un historique de traçabilité,
 * pas une copie du dossier médical.
 */
export async function enregistrerAudit(params: {
  patientId?: string;
  utilisateurId: string;
  action: ActionAudit;
  details?: string;
}): Promise<void> {
  try {
    await prisma.journalAudit.create({
      data: {
        patientId: params.patientId,
        utilisateurId: params.utilisateurId,
        action: params.action,
        details: params.details,
      },
    });
  } catch (error) {
    // L'audit ne doit jamais faire échouer l'action métier qu'il documente.
    console.error("[enregistrerAudit] échec de l'écriture du journal", error);
  }
}
