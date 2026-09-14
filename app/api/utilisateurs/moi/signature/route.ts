import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AccesRefuseError, getSessionUtilisateur } from "@/lib/auth-guards";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TAILLE_MAX_OCTETS = 500 * 1024; // 500 Ko

const uploadSchema = z.object({
  imageBase64: z.string().min(1, "Aucune image fournie."),
});

function decoderDataUrl(valeur: string): Buffer {
  const virgule = valeur.indexOf(",");
  const donnees = virgule !== -1 && valeur.startsWith("data:") ? valeur.slice(virgule + 1) : valeur;
  return Buffer.from(donnees, "base64");
}

// ---------------------------------------------------------------------------
// POST /api/utilisateurs/moi/signature — dépose sa propre signature (PNG).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    const { imageBase64 } = uploadSchema.parse(await request.json());

    const buffer = decoderDataUrl(imageBase64);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Image invalide." }, { status: 400 });
    }
    if (buffer.length > TAILLE_MAX_OCTETS) {
      return NextResponse.json({ error: "L'image dépasse la taille maximale de 500 Ko." }, { status: 400 });
    }
    if (!buffer.subarray(0, 8).equals(PNG_MAGIC)) {
      return NextResponse.json({ error: "Le fichier doit être une image PNG." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: utilisateur.id },
      data: { signature: buffer, signatureAjoutee: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/utilisateurs/moi/signature]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/utilisateurs/moi/signature — aperçu de la signature enregistrée.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const utilisateur = await getSessionUtilisateur();
    const donnees = await prisma.user.findUnique({
      where: { id: utilisateur.id },
      select: { signature: true },
    });

    if (!donnees?.signature) {
      return NextResponse.json({ error: "Aucune signature enregistrée." }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(donnees.signature), {
      status: 200,
      headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/utilisateurs/moi/signature]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/utilisateurs/moi/signature — supprime sa signature.
// ---------------------------------------------------------------------------

export async function DELETE() {
  try {
    const utilisateur = await getSessionUtilisateur();
    await prisma.user.update({
      where: { id: utilisateur.id },
      data: { signature: null, signatureAjoutee: null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[DELETE /api/utilisateurs/moi/signature]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
