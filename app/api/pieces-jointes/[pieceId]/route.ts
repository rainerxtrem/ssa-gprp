import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutEcrireDossierMedical,
  peutLireDossierMedical,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

// ---------------------------------------------------------------------------
// GET /api/pieces-jointes/[pieceId] — téléchargement/aperçu d'une pièce jointe.
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: { params: Promise<{ pieceId: string }> }) {
  try {
    const { pieceId } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const piece = await prisma.pieceJointe.findUnique({ where: { id: pieceId } });
    if (!piece) return NextResponse.json({ error: "Pièce jointe introuvable." }, { status: 404 });

    return new NextResponse(new Uint8Array(piece.contenu), {
      status: 200,
      headers: {
        "Content-Type": piece.typeMime,
        "Content-Disposition": `inline; filename="${piece.nomFichier.replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/pieces-jointes/[pieceId]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/pieces-jointes/[pieceId] — supprime une pièce jointe.
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ pieceId: string }> }) {
  try {
    const { pieceId } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut supprimer une pièce jointe." }, { status: 403 });
    }

    const piece = await prisma.pieceJointe.findUnique({
      where: { id: pieceId },
      include: { consultation: { select: { patientId: true } } },
    });
    if (!piece) return NextResponse.json({ error: "Pièce jointe introuvable." }, { status: 404 });

    await prisma.pieceJointe.delete({ where: { id: pieceId } });

    await enregistrerAudit({
      patientId: piece.consultation.patientId,
      utilisateurId: utilisateur.id,
      action: "PIECE_JOINTE_SUPPRIMEE",
      details: piece.nomFichier,
      documentId: piece.consultationId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[DELETE /api/pieces-jointes/[pieceId]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
