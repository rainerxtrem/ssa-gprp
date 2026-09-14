import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AccesRefuseError, getSessionUtilisateur, peutGererReferents } from "@/lib/auth-guards";
import { enregistrerAudit } from "@/lib/audit";

const referentSchema = z.object({
  unite: z.string().min(1),
  medecinId: z.string().min(1).nullable(),
});

// ---------------------------------------------------------------------------
// GET /api/referents — liste des médecins référents désignés par unité.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const utilisateur = await getSessionUtilisateur();
    if (!peutGererReferents(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const referents = await prisma.uniteReferent.findMany({
      include: { medecin: { select: { id: true, nom: true, prenom: true, grade: true } } },
    });

    return NextResponse.json({ referents });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/referents]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/referents — désigne (ou retire, si medecinId est null) le médecin
// référent d'une unité. Réservé au médecin-chef.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    if (!peutGererReferents(utilisateur.role)) {
      return NextResponse.json({ error: "Seul le médecin-chef peut désigner les référents d'unité." }, { status: 403 });
    }

    const { unite, medecinId } = referentSchema.parse(await request.json());

    if (medecinId === null) {
      await prisma.uniteReferent.deleteMany({ where: { unite } });
    } else {
      const medecin = await prisma.user.findUnique({ where: { id: medecinId } });
      if (!medecin) {
        return NextResponse.json({ error: "Médecin introuvable." }, { status: 404 });
      }
      await prisma.uniteReferent.upsert({
        where: { unite },
        create: { unite, medecinId },
        update: { medecinId },
      });
    }

    await enregistrerAudit({
      utilisateurId: utilisateur.id,
      action: "REFERENT_MODIFIE",
      details: medecinId ? `${unite} → ${medecinId}` : `${unite} — retiré`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/referents]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
