import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { peutGererUtilisateurs } from "@/lib/auth-guards";
import { PageHeader } from "@/components/ui/PageHeader";
import UtilisateurForm from "@/components/admin/UtilisateurForm";

export default async function NouvelUtilisateurPage() {
  const session = await getServerSession(authOptions);
  if (!peutGererUtilisateurs(session!.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Nouveau compte utilisateur"
        backHref="/dashboard/admin/utilisateurs"
        backLabel="Retour aux comptes"
      />
      <UtilisateurForm mode="creer" />
    </div>
  );
}
