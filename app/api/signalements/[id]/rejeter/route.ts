import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutHomologuerSignalement,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";
import { traiterSignalementSchema } from "@/lib/validation/signalement";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutHomologuerSignalement(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut traiter un signalement." }, { status: 403 });
    }

    const existant = await prisma.signalementInaptitude.findUnique({ where: { id } });
    if (!existant) return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 });
    if (existant.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Ce signalement a déjà été traité." }, { status: 409 });
    }

    const { commentaireMedecin } = traiterSignalementSchema.parse(await request.json());

    const signalement = await prisma.signalementInaptitude.update({
      where: { id },
      data: {
        statut: "REJETE",
        medecinId: utilisateur.id,
        commentaireMedecin,
        traiteLe: new Date(),
      },
    });

    await enregistrerAudit({
      patientId: signalement.patientId,
      utilisateurId: utilisateur.id,
      action: "SIGNALEMENT_REJETE",
      details: commentaireMedecin ?? signalement.motif,
      documentId: signalement.id,
    });

    return NextResponse.json({ signalement });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/signalements/[id]/rejeter]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
