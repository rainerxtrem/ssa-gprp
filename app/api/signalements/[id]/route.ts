import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutHomologuerSignalement,
  peutSignalerInaptitude,
} from "@/lib/auth-guards";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSignalerInaptitude(utilisateur.role) && !peutHomologuerSignalement(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const signalement = await prisma.signalementInaptitude.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, nom: true, prenom: true, grade: true, unite: true, ddn: true, rio: true, specialite: true } },
        infirmier: { select: { nom: true, prenom: true, grade: true } },
        medecin: { select: { nom: true, prenom: true, grade: true } },
      },
    });
    if (!signalement) return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 });

    return NextResponse.json({ signalement });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/signalements/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
