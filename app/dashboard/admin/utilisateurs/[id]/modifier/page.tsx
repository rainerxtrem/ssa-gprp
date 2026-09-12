import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutGererUtilisateurs } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import UtilisateurForm from "@/components/admin/UtilisateurForm";

export default async function ModifierUtilisateurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!peutGererUtilisateurs(session!.user.role)) {
    redirect("/dashboard");
  }
  if (id === session!.user.id) {
    redirect("/dashboard/admin/utilisateurs");
  }

  const utilisateur = await prisma.user.findUnique({ where: { id } });
  if (!utilisateur) notFound();

  return (
    <div>
      <PageHeader
        title="Modifier le compte"
        description={`${utilisateur.grade} ${utilisateur.prenom} ${utilisateur.nom} — ${utilisateur.email}`}
        backHref="/dashboard/admin/utilisateurs"
        backLabel="Retour aux comptes"
      />
      <UtilisateurForm
        mode="modifier"
        utilisateurId={utilisateur.id}
        valeursInitiales={{
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          grade: utilisateur.grade,
          role: utilisateur.role,
          actif: utilisateur.actif,
        }}
      />
    </div>
  );
}
