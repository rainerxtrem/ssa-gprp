import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AccesRefuseError, getSessionUtilisateur, interdireAccesDossierMedicalAuCommandement, peutLireDossierMedical } from "@/lib/auth-guards";
import { genererDossierPdf } from "@/lib/pdf/dossier";

// ---------------------------------------------------------------------------
// GET /api/patients/[id]/dossier-pdf — export PDF du dossier médical complet.
// Interdit au COMMANDEMENT : ce document contient tout le contenu clinique.
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        profilsSigycop: { orderBy: { dateEvaluation: "desc" } },
        certificatsSuivi: {
          orderBy: { dateCertificat: "desc" },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
        },
        certificatsEngagement: {
          orderBy: { dateCertificat: "desc" },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
        },
        consultations: {
          orderBy: { dateConsultation: "desc" },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
        },
        prescriptions: {
          orderBy: { datePrescription: "desc" },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
        },
        arretsTravail: { orderBy: { dateDebut: "desc" } },
        convocations: {
          orderBy: { dateConvocation: "desc" },
          include: { medecin: { select: { nom: true, prenom: true, grade: true } } },
        },
      },
    });

    if (!patient) return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });

    const pdf = await genererDossierPdf({
      patient: {
        nom: patient.nom,
        prenom: patient.prenom,
        ddn: patient.ddn,
        rio: patient.rio,
        grade: patient.grade,
        specialite: patient.specialite,
        unite: patient.unite,
      },
      profilsSigycop: patient.profilsSigycop,
      certificatsSuivi: patient.certificatsSuivi.map((c) => ({
        dateCertificat: c.dateCertificat,
        conclusion: c.conclusion,
        lieu: c.lieu,
        annuleLe: c.annuleLe,
        medecin: `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
      })),
      certificatsEngagement: patient.certificatsEngagement.map((c) => ({
        dateCertificat: c.dateCertificat,
        conclusion: c.conclusion,
        lieu: c.lieu,
        annuleLe: c.annuleLe,
        medecin: `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
      })),
      consultations: patient.consultations.map((c) => ({
        dateConsultation: c.dateConsultation,
        motif: c.motif,
        diagnostic: c.diagnostic,
        annuleLe: c.annuleLe,
        medecin: `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
      })),
      prescriptions: patient.prescriptions.map((p) => {
        const lignes = Array.isArray(p.medicaments) ? (p.medicaments as { nom: string }[]) : [];
        return {
          datePrescription: p.datePrescription,
          medicaments: lignes.map((m) => m.nom).join(", ") || "—",
          annuleLe: p.annuleLe,
          medecin: `${p.medecin.grade} ${p.medecin.prenom} ${p.medecin.nom}`,
        };
      }),
      arrets: patient.arretsTravail,
      convocations: patient.convocations.map((c) => ({
        dateConvocation: c.dateConvocation,
        statut: c.statut,
        medecin: `${c.medecin.grade} ${c.medecin.prenom} ${c.medecin.nom}`,
      })),
      genereLe: new Date(),
    });

    const nomFichier = `dossier-${patient.nom}-${patient.prenom}.pdf`.toLowerCase().replace(/\s+/g, "-");

    return new NextResponse(new Uint8Array(pdf), {
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
    console.error("[GET /api/patients/[id]/dossier-pdf]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
