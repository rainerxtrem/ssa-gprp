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
import { champsConsultationSchema } from "@/lib/validation/consultation";

// ---------------------------------------------------------------------------
// PATCH /api/consultations/[id] — modification d'une consultation existante.
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut modifier une consultation." },
        { status: 403 }
      );
    }

    const existante = await prisma.consultation.findUnique({ where: { id } });
    if (!existante) return NextResponse.json({ error: "Consultation introuvable." }, { status: 404 });
    if (existante.annuleLe) {
      return NextResponse.json({ error: "Une consultation annulée ne peut plus être modifiée." }, { status: 409 });
    }

    const donnees = champsConsultationSchema.parse(await request.json());

    const consultation = await prisma.consultation.update({ where: { id }, data: donnees });

    await enregistrerAudit({
      patientId: consultation.patientId,
      utilisateurId: utilisateur.id,
      action: "CONSULTATION_MODIFIEE",
      details: consultation.motif,
    });

    return NextResponse.json({ consultation });
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
    console.error("[PATCH /api/consultations/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
