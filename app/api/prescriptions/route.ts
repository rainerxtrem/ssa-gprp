import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutLireDossierMedical,
  peutPrescrire,
} from "@/lib/auth-guards";
import { genererOrdonnancePdf } from "@/lib/pdf/ordonnance";
import { enregistrerAudit } from "@/lib/audit";
import { champsPrescriptionSchema } from "@/lib/validation/prescription";

const createPrescriptionSchema = champsPrescriptionSchema.extend({
  patientId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// POST /api/prescriptions — rédaction d'une ordonnance (réservé aux médicaux),
// avec génération et stockage automatique du PDF dans le dossier du patient.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutPrescrire(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut rédiger une ordonnance." },
        { status: 403 }
      );
    }

    const donnees = createPrescriptionSchema.parse(await request.json());
    const datePrescription = donnees.datePrescription ?? new Date();

    const [patient, medecin] = await Promise.all([
      prisma.patient.findUnique({ where: { id: donnees.patientId } }),
      prisma.user.findUnique({ where: { id: utilisateur.id } }),
    ]);
    if (!patient) return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    if (!medecin) return NextResponse.json({ error: "Médecin introuvable." }, { status: 404 });

    const prescription = await prisma.prescription.create({
      data: {
        medicaments: donnees.medicaments,
        instructions: donnees.instructions,
        lieu: donnees.lieu,
        datePrescription,
        medecinId: utilisateur.id,
        patientId: patient.id,
      },
    });

    // Génération du PDF, stockée directement dans le dossier du patient.
    // Non bloquant : l'ordonnance est déjà enregistrée, un échec ici ne doit
    // jamais faire échouer la création aux yeux de l'utilisateur.
    let prescriptionFinale = prescription;
    try {
      const pdf = await genererOrdonnancePdf({
        patientNom: patient.nom,
        patientPrenom: patient.prenom,
        patientDdn: patient.ddn,
        patientRio: patient.rio,
        medicaments: donnees.medicaments,
        instructions: donnees.instructions,
        datePrescription,
        lieu: donnees.lieu,
        medecinNomComplet: `${medecin.prenom} ${medecin.nom}`,
        medecinSignaturePng: medecin.signature,
        medecinGrade: medecin.grade,
      });

      prescriptionFinale = await prisma.prescription.update({
        where: { id: prescription.id },
        data: { pdf, pdfGenereLe: new Date() },
      });
    } catch (erreurPdf) {
      console.error("[POST /api/prescriptions] Génération PDF échouée (ordonnance déjà enregistrée)", erreurPdf);
    }

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "ORDONNANCE_CREEE",
      details: donnees.medicaments.map((m) => m.nom).join(", "),
    });

    const { pdf: _pdf, ...prescriptionSansPdf } = prescriptionFinale;
    return NextResponse.json({ prescription: prescriptionSansPdf }, { status: 201 });
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
    console.error("[POST /api/prescriptions]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/prescriptions?patientId=... — interdit au COMMANDEMENT (secret médical).
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

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      orderBy: { datePrescription: "desc" },
      select: {
        id: true,
        medicaments: true,
        instructions: true,
        lieu: true,
        datePrescription: true,
        pdfGenereLe: true,
        annuleLe: true,
        medecin: { select: { nom: true, prenom: true, grade: true } },
      },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/prescriptions]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
