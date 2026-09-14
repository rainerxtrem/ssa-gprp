import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutEcrireDossierMedical,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const createPatientSchema = z.object({
  rio: z.string().min(1, "L'identifiant défense (RIO) est requis."),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  ddn: z.coerce.date(),
  grade: z.string().min(1),
  specialite: z.string().optional(),
  unite: z.string().min(1),
  antecedents: z.string().max(4000).optional(),
  allergies: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/patients — création d'un dossier patient (réservé aux médicaux).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut créer un dossier patient." },
        { status: 403 }
      );
    }

    const donnees = createPatientSchema.parse(await request.json());

    const patientExistant = await prisma.patient.findUnique({ where: { rio: donnees.rio } });
    if (patientExistant) {
      return NextResponse.json(
        { error: "Un patient avec cet identifiant défense (RIO) existe déjà." },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({ data: donnees });

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "PATIENT_CREE",
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides.", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/patients]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
