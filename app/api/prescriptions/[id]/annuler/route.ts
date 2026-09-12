import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutPrescrire,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const annulerSchema = z.object({ motif: z.string().min(1, "Le motif d'annulation est requis.") });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutPrescrire(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut annuler une ordonnance." }, { status: 403 });
    }

    const { motif } = annulerSchema.parse(await request.json());

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { annuleLe: new Date(), annuleMotif: motif },
    });

    await enregistrerAudit({
      patientId: prescription.patientId,
      utilisateurId: utilisateur.id,
      action: "ORDONNANCE_ANNULEE",
      details: motif,
    });

    const { pdf: _pdf, ...prescriptionSansPdf } = prescription;
    return NextResponse.json({ prescription: prescriptionSansPdf });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/prescriptions/[id]/annuler]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
