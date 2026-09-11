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

const createArretSchema = z
  .object({
    patientId: z.string().min(1),
    typeExemption: z.enum([
      "ARRET_TRAVAIL",
      "EXEMPTION_SPORT",
      "EXEMPTION_SERVICE",
      "PERMISSION_EXCEPTIONNELLE",
      "CONVALESCENCE",
    ]),
    dateDebut: z.coerce.date(),
    dateFin: z.coerce.date(),
    motif: z.string().max(2000).optional(),
    transmisCommandement: z.boolean().default(false),
  })
  .refine((d) => d.dateFin >= d.dateDebut, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["dateFin"],
  });

// ---------------------------------------------------------------------------
// POST /api/arrets-travail — réservé aux médicaux. Le `motif` reste soumis
// au secret médical : seul `transmisCommandement` détermine ce que voit le commandement.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut créer un arrêt de travail ou une exemption." },
        { status: 403 }
      );
    }

    const donnees = createArretSchema.parse(await request.json());

    const patient = await prisma.patient.findUnique({ where: { id: donnees.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const arret = await prisma.arretTravail.create({
      data: { ...donnees, medecinId: utilisateur.id },
    });

    return NextResponse.json({ arret }, { status: 201 });
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
    console.error("[POST /api/arrets-travail]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/arrets-travail?patientId=... — interdit au COMMANDEMENT (secret médical).
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

    const arrets = await prisma.arretTravail.findMany({
      where: { patientId },
      orderBy: { dateDebut: "desc" },
    });

    return NextResponse.json({ arrets });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/arrets-travail]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
