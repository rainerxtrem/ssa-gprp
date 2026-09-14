import { z } from "zod";
import { aptitudeStatusSchema } from "@/lib/validation/certificat";

export const creerSignalementSchema = z.object({
  patientId: z.string().min(1),
  motif: z.string().min(1, "Le motif du signalement est requis."),
  observations: z.string().max(4000).optional(),
  recommandation: aptitudeStatusSchema.optional(),
});

export const traiterSignalementSchema = z.object({
  commentaireMedecin: z.string().max(4000).optional(),
});
