import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AccesRefuseError,
  getSessionUtilisateur,
  interdireAccesDossierMedicalAuCommandement,
  peutEcrireDossierMedical,
} from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const TAILLE_MAX_OCTETS = 8 * 1024 * 1024; // 8 Mo
const TYPES_AUTORISES = ["image/png", "image/jpeg", "application/pdf"];

const uploadSchema = z.object({
  nomFichier: z.string().min(1),
  typeMime: z.enum(["image/png", "image/jpeg", "application/pdf"]),
  contenuBase64: z.string().min(1),
});

function decoderDataUrl(valeur: string): Buffer {
  const virgule = valeur.indexOf(",");
  const donnees = virgule !== -1 && valeur.startsWith("data:") ? valeur.slice(virgule + 1) : valeur;
  return Buffer.from(donnees, "base64");
}

// ---------------------------------------------------------------------------
// POST /api/consultations/[id]/pieces-jointes — ajoute une pièce jointe
// (image ou PDF : résultat de laboratoire, imagerie...).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    interdireAccesDossierMedicalAuCommandement(utilisateur.role);

    if (!peutEcrireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Seul un médecin peut ajouter une pièce jointe." }, { status: 403 });
    }

    const donnees = uploadSchema.parse(await request.json());
    const contenu = decoderDataUrl(donnees.contenuBase64);

    if (contenu.length === 0 || contenu.length > TAILLE_MAX_OCTETS) {
      return NextResponse.json({ error: "Le fichier dépasse la taille maximale de 8 Mo." }, { status: 400 });
    }
    if (!TYPES_AUTORISES.includes(donnees.typeMime)) {
      return NextResponse.json({ error: "Type de fichier non autorisé." }, { status: 400 });
    }

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return NextResponse.json({ error: "Consultation introuvable." }, { status: 404 });

    const piece = await prisma.pieceJointe.create({
      data: {
        nomFichier: donnees.nomFichier,
        typeMime: donnees.typeMime,
        taille: contenu.length,
        contenu,
        consultationId: id,
        ajouteParId: utilisateur.id,
      },
      select: { id: true, nomFichier: true, typeMime: true, taille: true, createdAt: true },
    });

    await enregistrerAudit({
      patientId: consultation.patientId,
      utilisateurId: utilisateur.id,
      action: "PIECE_JOINTE_AJOUTEE",
      details: donnees.nomFichier,
      documentId: id,
    });

    return NextResponse.json({ piece }, { status: 201 });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/consultations/[id]/pieces-jointes]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
