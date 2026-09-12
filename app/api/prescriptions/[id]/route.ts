import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutPrescrire,
} from "@/lib/auth-guards";
import { genererOrdonnancePdf } from "@/lib/pdf/ordonnance";
import { enregistrerAudit } from "@/lib/audit";
import { champsPrescriptionSchema } from "@/lib/validation/prescription";

// ---------------------------------------------------------------------------
// PATCH /api/prescriptions/[id] — modification d'une ordonnance existante,
// avec régénération du PDF.
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutPrescrire(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut modifier une ordonnance." }, { status: 403 });
    }

    const existante = await prisma.prescription.findUnique({ where: { id } });
    if (!existante) return NextResponse.json({ error: "Ordonnance introuvable." }, { status: 404 });
    if (existante.annuleLe) {
      return NextResponse.json({ error: "Une ordonnance annulée ne peut plus être modifiée." }, { status: 409 });
    }

    const donnees = champsPrescriptionSchema.parse(await request.json());
    const datePrescription = donnees.datePrescription ?? existante.datePrescription;

    const [patient, medecin] = await Promise.all([
      prisma.patient.findUnique({ where: { id: existante.patientId } }),
      prisma.user.findUnique({ where: { id: utilisateur.id } }),
    ]);
    if (!patient || !medecin) {
      return NextResponse.json({ error: "Patient ou médecin introuvable." }, { status: 404 });
    }

    let prescriptionFinale = await prisma.prescription.update({
      where: { id },
      data: {
        medicaments: donnees.medicaments,
        instructions: donnees.instructions,
        lieu: donnees.lieu,
        datePrescription,
      },
    });

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
        medecinGrade: medecin.grade,
      });
      prescriptionFinale = await prisma.prescription.update({
        where: { id },
        data: { pdf, pdfGenereLe: new Date() },
      });
    } catch (erreurPdf) {
      console.error("[PATCH /api/prescriptions/[id]] Génération PDF échouée", erreurPdf);
    }

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "ORDONNANCE_MODIFIEE",
      details: donnees.medicaments.map((m) => m.nom).join(", "),
    });

    const { pdf: _pdf, ...prescriptionSansPdf } = prescriptionFinale;
    return NextResponse.json({ prescription: prescriptionSansPdf });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[PATCH /api/prescriptions/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
