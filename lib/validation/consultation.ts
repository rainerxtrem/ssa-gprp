import { z } from "zod";

export const champsConsultationSchema = z.object({
  type: z.enum(["MEDICALE", "SUIVI_INFIRMIER"]).optional(),
  motif: z.string().min(1, "Le motif de consultation est requis."),
  anamnese: z.string().max(4000).optional(),
  examenClinique: z.string().max(4000).optional(),
  temperature: z.coerce.number().min(30).max(45).optional(),
  tensionSystolique: z.coerce.number().int().min(50).max(260).optional(),
  tensionDiastolique: z.coerce.number().int().min(30).max(160).optional(),
  frequenceCardiaque: z.coerce.number().int().min(20).max(250).optional(),
  saturationO2: z.coerce.number().int().min(50).max(100).optional(),
  poids: z.coerce.number().min(1).max(400).optional(),
  taille: z.coerce.number().min(30).max(250).optional(),
  diagnostic: z.string().max(4000).optional(),
  conduiteATenir: z.string().max(4000).optional(),
  dateConsultation: z.coerce.date().optional(),
});
