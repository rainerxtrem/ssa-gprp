import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutEcrireDossierMedical,
  peutLireDossierMedical,
} from "@/lib/auth-guards";

const createConsultationSchema = z.object({
  patientId: z.string().min(1),
  motif: z.string().min(1, "Le motif de consultation est requis."),
  anamnese: z.string().max(4000).optional(),
  examenClinique: z.string().max(4000).optional(),
  temperature: z.coerce.number().min(30).max(45).optional(),
  tensionSystolique: z.coerce.number().int().min(50).max(260).optional(),
  tensionDiastolique: z.coerce.number().int().min(30).max(160).optional(),
  frequenceCardiaque: z.coerce.number().int().min(20).max(250).optional(),
  saturationO2: z.coerce.number().int().min(50).max(100).optional(),
  poids: z.coerce.number().min(1).max(400).optional(),
  taille: z.coerce.number().min(30).max(250).optional(),
  diagnostic: z.string().max(4000).optional(),
  conduiteATenir: z.string().max(4000).optional(),
  dateConsultation: z.coerce.date().optional(),
});

// ---------------------------------------------------------------------------
// POST /api/consultations — consultation de médecine classique (réservé aux médicaux).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut rédiger une consultation." },
        { status: 403 }
      );
    }

    const donnees = createConsultationSchema.parse(await request.json());

    const patient = await prisma.patient.findUnique({ where: { id: donnees.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        ...donnees,
        dateConsultation: donnees.dateConsultation ?? new Date(),
        medecinId: utilisateur.id,
      },
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
