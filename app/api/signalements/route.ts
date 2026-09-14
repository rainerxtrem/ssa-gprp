import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutHomologuerSignalement,
  peutSignalerInaptitude,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";
import { creerSignalementSchema } from "@/lib/validation/signalement";

// ---------------------------------------------------------------------------
// POST /api/signalements
// Un paramédical signale une suspicion d'inaptitude repérée pendant un suivi
// infirmier autonome. Ce n'est jamais une décision d'aptitude : elle doit
// être homologuée (ou rejetée) par un médecin — voir /homologuer, /rejeter.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSignalerInaptitude(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un paramédical peut déclarer un signalement d'inaptitude." },
        { status: 403 }
      );
    }

    const donnees = creerSignalementSchema.parse(await request.json());

    const patient = await prisma.patient.findUnique({ where: { id: donnees.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const signalement = await prisma.signalementInaptitude.create({
      data: {
        patientId: patient.id,
        infirmierId: utilisateur.id,
        motif: donnees.motif,
        observations: donnees.observations,
        recommandation: donnees.recommandation ?? "NON_EVALUE",
      },
    });

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "SIGNALEMENT_CREE",
      details: donnees.motif,
      documentId: signalement.id,
    });

    return NextResponse.json({ signalement }, { status: 201 });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/signalements]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/signalements?patientId=...&statut=...
// File d'attente d'homologation (médecins) ou historique par patient.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSignalerInaptitude(utilisateur.role) && !peutHomologuerSignalement(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const patientId = request.nextUrl.searchParams.get("patientId");
    const statut = request.nextUrl.searchParams.get("statut");

    const signalements = await prisma.signalementInaptitude.findMany({
      where: {
        ...(patientId ? { patientId } : {}),
        ...(statut ? { statut: statut as "EN_ATTENTE" | "HOMOLOGUE" | "REJETE" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, nom: true, prenom: true, grade: true, unite: true } },
        infirmier: { select: { nom: true, prenom: true, grade: true } },
        medecin: { select: { nom: true, prenom: true, grade: true } },
      },
    });

    return NextResponse.json({ signalements });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/signalements]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
