import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutGenererConvocation,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const updateConvocationSchema = z.object({
  statut: z.enum(["PLANIFIEE", "HONOREE", "ANNULEE", "ABSENT"]),
});

// ---------------------------------------------------------------------------
// PATCH /api/convocations/[id] — met à jour le statut d'une convocation
// (honorée, annulée, absence constatée).
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutGenererConvocation(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { statut } = updateConvocationSchema.parse(await request.json());

    const convocation = await prisma.convocation.update({ where: { id }, data: { statut } });

    await enregistrerAudit({
      patientId: convocation.patientId,
      utilisateurId: utilisateur.id,
      action: "CONVOCATION_MODIFIEE",
      details: `Statut → ${statut}`,
    });

    return NextResponse.json({ convocation });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[PATCH /api/convocations/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
