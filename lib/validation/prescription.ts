import { z } from "zod";

export const ligneMedicamentSchema = z.object({
  nom: z.string().min(1, "Le nom du médicament est requis."),
  dosage: z.string().optional(),
  forme: z.string().optional(),
  posologie: z.string().min(1, "La posologie est requise."),
  duree: z.string().min(1, "La durée est requise."),
});

export const champsPrescriptionSchema = z.object({
  medicaments: z.array(ligneMedicamentSchema).min(1, "Au moins un médicament est requis."),
  instructions: z.string().max(2000).optional(),
  lieu: z.string().min(1, "Le lieu de signature est requis."),
  datePrescription: z.coerce.date().optional(),
});
