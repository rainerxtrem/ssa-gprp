import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutSignerCertificatAptitude,
  peutSupprimerDefinitivement,
} from "@/lib/auth-guards";
import { genererCertificatPdf } from "@/lib/pdf/certificat";
import { urlBase } from "@/lib/pdf/qrcode";
import { enregistrerAudit } from "@/lib/audit";
import { modifierCertificatSchema } from "@/lib/validation/certificat";

// ---------------------------------------------------------------------------
// PATCH /api/certificats/[id] — modification d'un certificat existant
// (SIGYCOP, aptitudes, conclusion...), avec régénération du PDF et mise à
// jour du profil SIGYCOP lié.
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSignerCertificatAptitude(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul un médecin peut modifier un certificat médical d'aptitude." },
        { status: 403 }
      );
    }

    const donnees = modifierCertificatSchema.parse(await request.json());
    const dateCertificat = donnees.dateCertificat ?? new Date();

    const existant =
      donnees.type === "ENGAGEMENT"
        ? await prisma.certificatEngagement.findUnique({ where: { id } })
        : await prisma.certificatSuiviAptitudes.findUnique({ where: { id } });
    if (!existant) return NextResponse.json({ error: "Certificat introuvable." }, { status: 404 });
    if (existant.annuleLe) {
      return NextResponse.json({ error: "Un certificat annulé ne peut plus être modifié." }, { status: 409 });
    }

    const [patient, medecin] = await Promise.all([
      prisma.patient.findUnique({ where: { id: existant.patientId } }),
      prisma.user.findUnique({ where: { id: utilisateur.id } }),
    ]);
    if (!patient || !medecin) {
      return NextResponse.json({ error: "Patient ou médecin introuvable." }, { status: 404 });
    }

    const donneesCommunes = {
      ...donnees.sigycop,
      ...donnees.aptitudes,
      observations: donnees.observations,
      lieu: donnees.lieu,
      dateCertificat,
    };

    let certificatFinal = await prisma.$transaction(async (tx) => {
      if (existant.profilSigycopId) {
        await tx.profilSigycop.update({
          where: { id: existant.profilSigycopId },
          data: { ...donnees.sigycop, dateEvaluation: dateCertificat },
        });
      }

      if (donnees.type === "ENGAGEMENT") {
        return tx.certificatEngagement.update({
          where: { id },
          data: { ...donneesCommunes, conclusion: donnees.conclusion },
        });
      }

      return tx.certificatSuiviAptitudes.update({
        where: { id },
        data: { ...donneesCommunes, conclusion: donnees.conclusion },
      });
    });

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
        medecinSignaturePng: medecin.signature,
        medecinGrade: medecin.grade,
        urlVerification: `${urlBase()}/dashboard/patients/${patient.id}/certificats/${id}?type=${donnees.type}`,
      });

      certificatFinal =
        donnees.type === "ENGAGEMENT"
          ? await prisma.certificatEngagement.update({ where: { id }, data: { pdf, pdfGenereLe: new Date() } })
          : await prisma.certificatSuiviAptitudes.update({ where: { id }, data: { pdf, pdfGenereLe: new Date() } });
    } catch (erreurPdf) {
      console.error("[PATCH /api/certificats/[id]] Génération PDF échouée", erreurPdf);
    }

    const { pdf: _pdfAvant, ...existantSansPdf } = existant;
    await enregistrerAudit({
      patientId: patient.id,
      utilisateurId: utilisateur.id,
      action: "CERTIFICAT_MODIFIE",
      details: `${donnees.type} — ${donnees.conclusion}`,
      documentId: id,
      donneesAvant: existantSansPdf,
    });

    const { pdf: _pdf, ...certificatSansPdf } = certificatFinal;
    return NextResponse.json({ certificat: certificatSansPdf });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[PATCH /api/certificats/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/certificats/[id] — suppression définitive, réservée au médecin-chef.
// ---------------------------------------------------------------------------

const supprimerSchema = z.object({
  type: z.enum(["ENGAGEMENT", "SUIVI"]),
  motif: z.string().min(1, "Le motif est requis."),
});

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutSupprimerDefinitivement(utilisateur.role)) {
      return NextResponse.json(
        { error: "Seul le médecin-chef peut supprimer définitivement un document." },
        { status: 403 }
      );
    }

    const { type, motif } = supprimerSchema.parse(await request.json());

    const certificat =
      type === "ENGAGEMENT"
        ? await prisma.certificatEngagement.findUnique({ where: { id } })
        : await prisma.certificatSuiviAptitudes.findUnique({ where: { id } });
    if (!certificat) return NextResponse.json({ error: "Certificat introuvable." }, { status: 404 });

    await enregistrerAudit({
      patientId: certificat.patientId,
      utilisateurId: utilisateur.id,
      action: "CERTIFICAT_SUPPRIME",
      details: `${type} — ${motif}`,
      documentId: id,
    });

    if (type === "ENGAGEMENT") {
      await prisma.certificatEngagement.delete({ where: { id } });
    } else {
      await prisma.certificatSuiviAptitudes.delete({ where: { id } });
    }
    if (certificat.profilSigycopId) {
      await prisma.profilSigycop.delete({ where: { id: certificat.profilSigycopId } }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[DELETE /api/certificats/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
