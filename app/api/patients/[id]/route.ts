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

const updatePatientSchema = z.object({
  rio: z.string().min(1),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  ddn: z.coerce.date(),
  grade: z.string().min(1),
  specialite: z.string().optional(),
  unite: z.string().min(1),
});

// ---------------------------------------------------------------------------
// PATCH /api/patients/[id] — modification du dossier administratif du patient
// (réservé aux médicaux ; le contenu clinique n'est jamais modifié ici).
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut modifier un dossier patient." },
        { status: 403 }
      );
    }

    const donnees = updatePatientSchema.parse(await request.json());

    const avant = await prisma.patient.findUnique({ where: { id } });
    if (!avant) return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });

    const conflit = await prisma.patient.findFirst({
      where: { rio: donnees.rio, NOT: { id } },
    });
    if (conflit) {
      return NextResponse.json(
        { error: "Un autre patient utilise déjà cet identifiant défense (RIO)." },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.update({ where: { id }, data: donnees });

    const champsModifies = (Object.keys(donnees) as (keyof typeof donnees)[]).filter(
      (champ) => String(avant[champ] ?? "") !== String(donnees[champ] ?? "")
    );
    if (champsModifies.length > 0) {
      await enregistrerAudit({
        patientId: patient.id,
        utilisateurId: utilisateur.id,
        action: "PATIENT_MODIFIE",
        details: `Champs modifiés : ${champsModifies.join(", ")}`,
      });
    }

    return NextResponse.json({ patient });
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
    console.error("[PATCH /api/patients/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
