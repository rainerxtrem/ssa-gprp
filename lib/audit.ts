import { prisma } from "@/lib/prisma";

export type ActionAudit =
  | "PATIENT_CREE"
  | "PATIENT_MODIFIE"
  | "CONSULTATION_CREEE"
  | "CONSULTATION_MODIFIEE"
  | "CONSULTATION_ANNULEE"
  | "CONSULTATION_SUPPRIMEE"
  | "PIECE_JOINTE_AJOUTEE"
  | "PIECE_JOINTE_SUPPRIMEE"
  | "ORDONNANCE_CREEE"
  | "ORDONNANCE_MODIFIEE"
  | "ORDONNANCE_ANNULEE"
  | "ORDONNANCE_SUPPRIMEE"
  | "CERTIFICAT_CREE"
  | "CERTIFICAT_MODIFIE"
  | "CERTIFICAT_ANNULE"
  | "CERTIFICAT_SUPPRIME"
  | "ARRET_CREE"
  | "CONVOCATION_CREEE"
  | "CONVOCATION_MODIFIEE";

export const LIBELLES_ACTION_AUDIT: Record<ActionAudit, string> = {
  PATIENT_CREE: "Dossier patient créé",
  PATIENT_MODIFIE: "Dossier patient modifié",
  CONSULTATION_CREEE: "Consultation créée",
  CONSULTATION_MODIFIEE: "Consultation modifiée",
  CONSULTATION_ANNULEE: "Consultation annulée",
  CONSULTATION_SUPPRIMEE: "Consultation supprimée définitivement",
  PIECE_JOINTE_AJOUTEE: "Pièce jointe ajoutée",
  PIECE_JOINTE_SUPPRIMEE: "Pièce jointe supprimée",
  ORDONNANCE_CREEE: "Ordonnance créée",
  ORDONNANCE_MODIFIEE: "Ordonnance modifiée",
  ORDONNANCE_ANNULEE: "Ordonnance annulée",
  ORDONNANCE_SUPPRIMEE: "Ordonnance supprimée définitivement",
  CERTIFICAT_CREE: "Certificat créé",
  CERTIFICAT_MODIFIE: "Certificat modifié",
  CERTIFICAT_ANNULE: "Certificat annulé",
  CERTIFICAT_SUPPRIME: "Certificat supprimé définitivement",
  ARRET_CREE: "Arrêt / exemption créé",
  CONVOCATION_CREEE: "Convocation créée",
  CONVOCATION_MODIFIEE: "Convocation modifiée",
};

/**
 * Enregistre une entrée dans le journal d'audit du dossier patient.
 * `details` doit rester un résumé non sensible (jamais de diagnostic, de motif
 * médical ou d'ordonnance en clair) — c'est un historique de traçabilité,
 * pas une copie du dossier médical.
 *
 * `documentId` permet de retrouver l'historique d'un document précis.
 * `donneesAvant` capture un instantané du document juste avant une
 * modification, pour reconstituer ses versions successives.
 */
export async function enregistrerAudit(params: {
  patientId?: string;
  utilisateurId: string;
  action: ActionAudit;
  details?: string;
  documentId?: string;
  donneesAvant?: object;
}): Promise<void> {
  try {
    await prisma.journalAudit.create({
      data: {
        patientId: params.patientId,
        utilisateurId: params.utilisateurId,
        action: params.action,
        details: params.details,
        documentId: params.documentId,
        donneesAvant: params.donneesAvant as never,
      },
    });
  } catch (error) {
    // L'audit ne doit jamais faire échouer l'action métier qu'il documente.
    console.error("[enregistrerAudit] échec de l'écriture du journal", error);
  }
}
