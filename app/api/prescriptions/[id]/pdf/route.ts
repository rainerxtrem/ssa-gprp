import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutLireDossierMedical,
} from "@/lib/auth-guards";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      select: { pdf: true, patient: { select: { nom: true, prenom: true } } },
    });

    if (!prescription || !prescription.pdf) {
      return NextResponse.json({ error: "Ordonnance ou PDF introuvable." }, { status: 404 });
    }

    const nomFichier = `ordonnance-${prescription.patient.nom}-${prescription.patient.prenom}.pdf`
      .toLowerCase()
      .replace(/\s+/g, "-");

    return new NextResponse(new Uint8Array(prescription.pdf), {
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
    console.error("[GET /api/prescriptions/[id]/pdf]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
