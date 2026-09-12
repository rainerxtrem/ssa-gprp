import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AccesRefuseError, getSessionUtilisateur, peutGererUtilisateurs } from "@/lib/auth-guards";

const createUtilisateurSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  grade: z.string().min(1),
  role: z.nativeEnum(Role),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

// ---------------------------------------------------------------------------
// POST /api/utilisateurs — création d'un compte (réservé au médecin-chef).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    if (!peutGererUtilisateurs(utilisateur.role)) {
      return NextResponse.json({ error: "Seul le médecin-chef peut gérer les comptes." }, { status: 403 });
    }

    const donnees = createUtilisateurSchema.parse(await request.json());

    const existant = await prisma.user.findUnique({ where: { email: donnees.email.toLowerCase() } });
    if (existant) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await hash(donnees.motDePasse, 10);

    const nouvelUtilisateur = await prisma.user.create({
      data: {
        email: donnees.email.toLowerCase(),
        nom: donnees.nom,
        prenom: donnees.prenom,
        grade: donnees.grade,
        role: donnees.role,
        passwordHash,
      },
      select: { id: true, email: true, nom: true, prenom: true, grade: true, role: true, actif: true, createdAt: true },
    });

    return NextResponse.json({ utilisateur: nouvelUtilisateur }, { status: 201 });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides.", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/utilisateurs]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/utilisateurs — liste des comptes (réservé au médecin-chef).
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const utilisateur = await getSessionUtilisateur();
    if (!peutGererUtilisateurs(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const utilisateurs = await prisma.user.findMany({
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      select: { id: true, email: true, nom: true, prenom: true, grade: true, role: true, actif: true, createdAt: true },
    });

    return NextResponse.json({ utilisateurs });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/utilisateurs]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
