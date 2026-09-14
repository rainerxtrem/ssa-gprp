import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutCreerConsultationSuiviInfirmier,
  peutEcrireDossierMedical,
  peutLireDossierMedical,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";
import { champsConsultationSchema } from "@/lib/validation/consultation";

const createConsultationSchema = champsConsultationSchema.extend({
  patientId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// POST /api/consultations — consultation de médecine classique (réservé aux médicaux).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    const donnees = createConsultationSchema.parse(await request.json());

    // Un médecin rédige librement ; un paramédical ne peut créer qu'une
    // consultation de suivi infirmier autonome (maladie chronique,
    // post-pathologie) — jamais une consultation médicale classique.
    const estMedecin = peutEcrireDossierMedical(utilisateur.role);
    const estSuiviInfirmier = peutCreerConsultationSuiviInfirmier(utilisateur.role) && donnees.type === "SUIVI_INFIRMIER";
    if (!estMedecin && !estSuiviInfirmier) {
      return NextResponse.json(
        {
          error:
            "Seul un médecin peut rédiger une consultation médicale. Un paramédical ne peut créer qu'une consultation de suivi infirmier.",
        },
        { status: 403 }
      );
    }

    const patient = await prisma.patient.findUnique({ where: { id: donnees.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        ...donnees,
        type: estMedecin ? donnees.type ?? "MEDICALE" : "SUIVI_INFIRMIER",
        dateConsultation: donnees.dateConsultation ?? new Date(),
        medecinId: utilisateur.id,
      },
    });

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "CONSULTATION_CREEE",
      details: consultation.motif,
    });

    return NextResponse.json({ consultation }, { status: 201 });
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
    console.error("[POST /api/consultations]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/consultations?patientId=... — interdit au COMMANDEMENT (secret médical).
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

    const consultations = await prisma.consultation.findMany({
      where: { patientId },
      orderBy: { dateConsultation: "desc" },
      include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
    });

    return NextResponse.json({ consultations });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/consultations]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
