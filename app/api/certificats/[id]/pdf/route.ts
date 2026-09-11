import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutLireDossierMedical,
} from "@/lib/auth-guards";

// ---------------------------------------------------------------------------
// GET /api/certificats/[id]/pdf?type=ENGAGEMENT|SUIVI
// Sert le PDF stocké dans le dossier du patient (secret médical : jamais au COMMANDEMENT).
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const type = request.nextUrl.searchParams.get("type");
    if (type !== "ENGAGEMENT" && type !== "SUIVI") {
      return NextResponse.json(
        { error: "Le paramètre type doit valoir ENGAGEMENT ou SUIVI." },
        { status: 400 }
      );
    }

    const certificat =
      type === "ENGAGEMENT"
        ? await prisma.certificatEngagement.findUnique({
            where: { id },
            select: { pdf: true, nom: true, prenom: true, dateCertificat: true },
          })
        : await prisma.certificatSuiviAptitudes.findUnique({
            where: { id },
            select: { pdf: true, nom: true, prenom: true, dateCertificat: true },
          });

    if (!certificat || !certificat.pdf) {
      return NextResponse.json({ error: "Certificat ou PDF introuvable." }, { status: 404 });
    }

    const nomFichier = `certificat-${type.toLowerCase()}-${certificat.nom}-${certificat.prenom}.pdf`
      .toLowerCase()
      .replace(/\s+/g, "-");

    return new NextResponse(new Uint8Array(certificat.pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nomFichier}"`,
      },
    });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/certificats/[id]/pdf]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
