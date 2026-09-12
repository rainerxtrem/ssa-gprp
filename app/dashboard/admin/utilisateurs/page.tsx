import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutGererUtilisateurs } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/roles";
import { bouton } from "@/lib/ui";
import type { Role } from "@prisma/client";

export default async function UtilisateursPage() {
  const session = await getServerSession(authOptions);
  if (!peutGererUtilisateurs(session!.user.role)) {
    redirect("/dashboard");
  }

  const utilisateurs = await prisma.user.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    select: { id: true, email: true, nom: true, prenom: true, grade: true, role: true, actif: true },
  });

  return (
    <div>
      <PageHeader
        title="Comptes utilisateurs"
        description="Création et gestion des accès (réservé au médecin-chef)"
        action={
          <Link href="/dashboard/admin/utilisateurs/nouveau" className={bouton("primaire")}>
            <UserPlus className="h-4 w-4" />
            Nouveau compte
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {utilisateurs.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.grade} {u.prenom} {u.nom}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role as Role]}</td>
                <td className="px-4 py-3">
                  <Badge couleur={u.actif ? "emerald" : "slate"}>{u.actif ? "Actif" : "Désactivé"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {session!.user.id !== u.id && (
                    <Link
                      href={`/dashboard/admin/utilisateurs/${u.id}/modifier`}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Modifier →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
