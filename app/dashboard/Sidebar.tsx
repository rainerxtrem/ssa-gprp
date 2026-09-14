"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, PenLine, ShieldCheck, UserCog, Users } from "lucide-react";
import { libelleRole } from "@/lib/format";
import { PatientSearch } from "@/components/dashboard/PatientSearch";

export default function Sidebar({
  nomComplet,
  grade,
  role,
}: {
  nomComplet: string;
  grade: string;
  role: string;
}) {
  const pathname = usePathname();
  const estCommandement = role === "COMMANDEMENT";
  const estMedecinChef = role === "MEDECIN_CHEF";

  const liens = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/patients", label: "Patients", icon: Users, exact: false },
    ...(estMedecinChef
      ? [{ href: "/dashboard/admin/utilisateurs", label: "Utilisateurs", icon: UserCog, exact: false }]
      : []),
    { href: "/dashboard/profil", label: "Mon profil", icon: PenLine, exact: false },
  ];

  return (
    <aside className="flex flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:h-screen md:w-64 md:flex-shrink-0 md:flex-col md:items-stretch md:justify-between md:border-b-0 md:border-r md:px-4 md:py-6 print:hidden">
      <div>
        <div className="flex items-center gap-2 md:mb-6">
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
          <span className="font-bold uppercase tracking-wide text-slate-900">SSA GPRP</span>
        </div>

        {!estCommandement && (
          <div className="hidden md:mb-6 md:block">
            <PatientSearch />
          </div>
        )}

        <nav className="flex items-center gap-1 md:flex-1 md:flex-col md:items-stretch md:gap-1">
          {liens.map(({ href, label, icon: Icon, exact }) => {
            const actif = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  actif ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block md:border-t md:border-slate-100 md:pt-4">
        <p className="truncate text-sm font-medium text-slate-800">
          {grade} {nomComplet}
        </p>
        <p className="truncate text-xs text-slate-400">{libelleRole(role)}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
        aria-label="Déconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </aside>
  );
}
