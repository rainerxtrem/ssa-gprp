import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutGenererConvocation,
  peutLireDossierMedical,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const createConvocationSchema = z.object({
  patientId: z.string().min(1),
  dateConvocation: z.coerce.date(),
  motif: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/convocations — convocation à une visite médicale.
// Médicaux ET paramédicaux peuvent en générer (cf. matrice d'habilitation).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutGenererConvocation(utilisateur.role)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas habilité à générer une convocation." },
        { status: 403 }
      );
    }

    const donnees = createConvocationSchema.parse(await request.json());

    const patient = await prisma.patient.findUnique({ where: { id: donnees.patientId } });
    if (!patient) return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });

    const convocation = await prisma.convocation.create({
      data: { ...donnees, medecinId: utilisateur.id },
    });

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "CONVOCATION_CREEE",
      details: convocation.dateConvocation.toISOString(),
    });

    return NextResponse.json({ convocation }, { status: 201 });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/convocations]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/convocations?patientId=... — interdit au COMMANDEMENT.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const patientId = request.nextUrl.searchParams.get("patientId");
    if (!patientId) {
      return NextResponse.json({ error: "Le paramètre patientId est requis." }, { status: 400 });
    }

    const convocations = await prisma.convocation.findMany({
      where: { patientId },
      orderBy: { dateConvocation: "desc" },
      include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
    });

    return NextResponse.json({ convocations });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/convocations]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
