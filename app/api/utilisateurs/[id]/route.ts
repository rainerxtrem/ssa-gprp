import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AccesRefuseError, getSessionUtilisateur, peutGererUtilisateurs } from "@/lib/auth-guards";

const updateUtilisateurSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  grade: z.string().min(1),
  role: z.nativeEnum(Role),
  actif: z.boolean(),
  nouveauMotDePasse: z.string().min(8).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// PATCH /api/utilisateurs/[id] — modification d'un compte (réservé au médecin-chef).
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const utilisateur = await getSessionUtilisateur();
    if (!peutGererUtilisateurs(utilisateur.role)) {
      return NextResponse.json({ error: "Seul le médecin-chef peut gérer les comptes." }, { status: 403 });
    }

    if (id === utilisateur.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre compte depuis cet écran." },
        { status: 400 }
      );
    }

    const donnees = updateUtilisateurSchema.parse(await request.json());

    const data: Record<string, unknown> = {
      nom: donnees.nom,
      prenom: donnees.prenom,
      grade: donnees.grade,
      role: donnees.role,
      actif: donnees.actif,
    };
    if (donnees.nouveauMotDePasse) {
      data.passwordHash = await hash(donnees.nouveauMotDePasse, 10);
    }

    const utilisateurModifie = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, nom: true, prenom: true, grade: true, role: true, actif: true, createdAt: true },
    });

    return NextResponse.json({ utilisateur: utilisateurModifie });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[PATCH /api/utilisateurs/[id]]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
