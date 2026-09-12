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

const annulerSchema = z.object({ motif: z.string().min(1, "Le motif d'annulation est requis.") });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut annuler une consultation." }, { status: 403 });
    }

    const { motif } = annulerSchema.parse(await request.json());

    const consultation = await prisma.consultation.update({
      where: { id },
      data: { annuleLe: new Date(), annuleMotif: motif },
    });

    await enregistrerAudit({
      patientId: consultation.patientId,
      utilisateurId: utilisateur.id,
      action: "CONSULTATION_ANNULEE",
      details: motif,
    });

    return NextResponse.json({ consultation });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/consultations/[id]/annuler]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
