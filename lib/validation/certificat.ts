import { z } from "zod";

export const aptitudeStatusSchema = z.enum(["APTE", "APTE_RESTRICTION", "INAPTE", "NON_EVALUE"]);

export const aptitudesSchema = z.object({
  aptitudeGeneraleSPP: aptitudeStatusSchema,
  aptitudeInitialeGES: aptitudeStatusSchema,
  aptitudeMIR: aptitudeStatusSchema,
  aptitudeGRIMP: aptitudeStatusSchema,
  aptitudeNRBCe: aptitudeStatusSchema,
  aptitudeGHSC: aptitudeStatusSchema,
  conduiteGroupeLeger: aptitudeStatusSchema,
  conduiteGroupeLourd: aptitudeStatusSchema,
  opex: aptitudeStatusSchema,
  contreIndicationEPMS: z.boolean().default(false),
});

export const sigycopSchema = z.object({
  s: z.number().int().min(1).max(6),
  i: z.number().int().min(1).max(6),
  g: z.number().int().min(1).max(6),
  y: z.number().int().min(1).max(6),
  c: z.number().int().min(1).max(6),
  o: z.number().int().min(1).max(6),
  p: z.number().int().min(1).max(6),
});

const baseCertificatSchema = z.object({
  sigycop: sigycopSchema,
  aptitudes: aptitudesSchema,
  observations: z.string().max(4000).optional(),
  lieu: z.string().min(1, "Le lieu de signature est requis."),
  dateCertificat: z.coerce.date().optional(),
});

export const modifierCertificatSchema = z.discriminatedUnion("type", [
  baseCertificatSchema.extend({
    type: z.literal("ENGAGEMENT"),
    conclusion: z.enum(["APTE_ENGAGEMENT", "INAPTE_TEMPORAIRE", "INAPTE", "AJOURNEMENT"]),
  }),
  baseCertificatSchema.extend({
    type: z.literal("SUIVI"),
    conclusion: z.enum([
      "APTE_A_SERVIR",
      "APTE_A_SERVIR_AVEC_RESTRICTION",
      "INAPTE_TEMPORAIRE_A_SERVIR",
      "INAPTE_DEFINITIF_A_SERVIR",
    ]),
  }),
]);

export const creerCertificatSchema = z.discriminatedUnion("type", [
  baseCertificatSchema.extend({
    type: z.literal("ENGAGEMENT"),
    patientId: z.string().min(1),
    conclusion: z.enum(["APTE_ENGAGEMENT", "INAPTE_TEMPORAIRE", "INAPTE", "AJOURNEMENT"]),
  }),
  baseCertificatSchema.extend({
    type: z.literal("SUIVI"),
    patientId: z.string().min(1),
    conclusion: z.enum([
      "APTE_A_SERVIR",
      "APTE_A_SERVIR_AVEC_RESTRICTION",
      "INAPTE_TEMPORAIRE_A_SERVIR",
      "INAPTE_DEFINITIF_A_SERVIR",
    ]),
  }),
]);
