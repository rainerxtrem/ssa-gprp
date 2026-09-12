import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutLireDossierMedical,
  peutSignerCertificatAptitude,
} from "@/lib/auth-guards";
import { genererCertificatPdf } from "@/lib/pdf/certificat";
import { enregistrerAudit } from "@/lib/audit";
import { creerCertificatSchema } from "@/lib/validation/certificat";

// ---------------------------------------------------------------------------
// POST /api/certificats
// Crée un certificat d'aptitude (engagement ou suivi) et met à jour
// automatiquement le profil SIGYCOP du patient dans la même transaction.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();

    // Barrière du secret médical, puis contrôle métier fin : seul un médecin signe.
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);
    if (!peutSignerCertificatAptitude(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut signer un certificat médical d'aptitude." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const donnees = creerCertificatSchema.parse(json);
    const dateCertificat = donnees.dateCertificat ?? new Date();

    const [patient, medecin] = await Promise.all([
      prisma.patient.findUnique({ where: { id: donnees.patientId } }),
      prisma.user.findUnique({ where: { id: utilisateur.id } }),
    ]);
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }
    if (!medecin) {
      return NextResponse.json({ error: "Médecin introuvable." }, { status: 404 });
    }

    const certificat = await prisma.$transaction(async (tx) => {
      // Mise à jour automatique du profil SIGYCOP du patient à chaque nouveau certificat.
      const profilSigycop = await tx.profilSigycop.create({
        data: {
          ...donnees.sigycop,
          dateEvaluation: dateCertificat,
          medecinId: utilisateur.id,
          patientId: patient.id,
        },
      });

      const donneesCommunes = {
        nom: patient.nom,
        prenom: patient.prenom,
        ddn: patient.ddn,
        rio: patient.rio,
        ...donnees.sigycop,
        ...donnees.aptitudes,
        observations: donnees.observations,
        lieu: donnees.lieu,
        dateCertificat,
        medecinId: utilisateur.id,
        patientId: patient.id,
        profilSigycopId: profilSigycop.id,
      };

      if (donnees.type === "ENGAGEMENT") {
        return tx.certificatEngagement.create({
          data: { ...donneesCommunes, conclusion: donnees.conclusion },
        });
      }

      return tx.certificatSuiviAptitudes.create({
        data: { ...donneesCommunes, conclusion: donnees.conclusion },
      });
    });

    // Génération du PDF et stockage direct dans le dossier du patient (colonne `pdf` du certificat).
    // Non bloquant : le certificat est déjà enregistré, un échec ici ne doit jamais
    // faire échouer la création aux yeux de l'utilisateur.
    let certificatFinal = certificat;
    try {
      const pdf = await genererCertificatPdf({
        type: donnees.type,
        nom: patient.nom,
        prenom: patient.prenom,
        ddn: patient.ddn,
        rio: patient.rio,
        grade: patient.grade,
        specialite: patient.specialite,
        ...donnees.sigycop,
        ...donnees.aptitudes,
        observations: donnees.observations,
        conclusion: donnees.conclusion,
        lieu: donnees.lieu,
        dateCertificat,
        medecinNomComplet: `${medecin.prenom} ${medecin.nom}`,
        medecinGrade: medecin.grade,
      });

      certificatFinal =
        donnees.type === "ENGAGEMENT"
          ? await prisma.certificatEngagement.update({
              where: { id: certificat.id },
              data: { pdf, pdfGenereLe: new Date() },
            })
          : await prisma.certificatSuiviAptitudes.update({
              where: { id: certificat.id },
              data: { pdf, pdfGenereLe: new Date() },
            });
    } catch (erreurPdf) {
      console.error("[POST /api/certificats] Génération PDF échouée (certificat déjà enregistré)", erreurPdf);
    }

    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "CERTIFICAT_CREE",
      details: `${donnees.type} — ${donnees.conclusion}`,
    });

    const { pdf: _pdf, ...certificatSansPdf } = certificatFinal;
    return NextResponse.json({ certificat: certificatSansPdf }, { status: 201 });
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
    console.error("[POST /api/certificats]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/certificats?patientId=...
// Liste les certificats d'un patient. Interdit au COMMANDEMENT (secret médical) :
// ce rôle ne doit jamais recevoir de conclusion d'aptitude détaillée ni de SIGYCOP.
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

    // `pdf` (Bytes) est volontairement exclu : trop volumineux pour une liste,
    // récupéré à la demande via /api/certificats/[id]/pdf.
    const certificatSelect = {
      id: true,
      conclusion: true,
      dateCertificat: true,
      lieu: true,
      pdfGenereLe: true,
      annuleLe: true,
      medecinId: true,
      createdAt: true,
    } as const;

    const [certificatsEngagement, certificatsSuivi] = await Promise.all([
      prisma.certificatEngagement.findMany({
        where: { patientId },
        orderBy: { dateCertificat: "desc" },
        select: certificatSelect,
      }),
      prisma.certificatSuiviAptitudes.findMany({
        where: { patientId },
        orderBy: { dateCertificat: "desc" },
        select: certificatSelect,
      }),
    ]);

    return NextResponse.json({ certificatsEngagement, certificatsSuivi });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/certificats]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
