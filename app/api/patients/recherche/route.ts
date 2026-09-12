import { NextRequest, NextResponse } from "next/server";
import { AccesRefuseError, getSessionUtilisateur, peutLireDossierMedical } from "@/lib/auth-guards";
import { rechercherPatients } from "@/lib/patients";

// ---------------------------------------------------------------------------
// GET /api/patients/recherche?q=... — recherche globale (nom, prénom, RIO).
// Réservée aux médicaux/paramédicaux : le COMMANDEMENT navigue uniquement
// depuis sa liste de synthèses, jamais via une recherche libre.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const utilisateur = await getSessionUtilisateur();
    if (!peutLireDossierMedical(utilisateur.role)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const q = request.nextUrl.searchParams.get("q") ?? "";
    const patients = await rechercherPatients(q);

    return NextResponse.json({ patients });
  } catch (error) {
    if (error instanceof AccesRefuseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[GET /api/patients/recherche]", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
