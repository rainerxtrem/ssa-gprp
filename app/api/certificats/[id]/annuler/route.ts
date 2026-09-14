import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutSignerCertificatAptitude,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const annulerSchema = z.object({
  type: z.enum(["ENGAGEMENT", "SUIVI"]),
  motif: z.string().min(1, "Le motif d'annulation est requis."),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSignerCertificatAptitude(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut annuler un certificat." }, { status: 403 });
    }

    const { type, motif } = annulerSchema.parse(await request.json());

    const certificat =
      type === "ENGAGEMENT"
        ? await prisma.certificatEngagement.update({
            where: { id },
            data: { annuleLe: new Date(), annuleMotif: motif },
          })
        : await prisma.certificatSuiviAptitudes.update({
            where: { id },
            data: { annuleLe: new Date(), annuleMotif: motif },
          });

    await enregistrerAudit({
      patientId: certificat.patientId,
      utilisateurId: utilisateur.id,
      action: "CERTIFICAT_ANNULE",
      details: `${type} — ${motif}`,
      documentId: id,
    });

    const { pdf: _pdf, ...certificatSansPdf } = certificat;
    return NextResponse.json({ certificat: certificatSansPdf });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/certificats/[id]/annuler]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
