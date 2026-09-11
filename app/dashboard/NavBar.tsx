"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";

export default function NavBar({
  nomComplet,
  grade,
  role,
}: {
  nomComplet: string;
  grade: string;
  role: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold uppercase tracking-wide">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
          SSA GPRP
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard/patients" className="text-slate-600 hover:text-slate-900">
            Patients
          </Link>
          <div className="text-right leading-tight">
            <p className="font-medium">{grade} {nomComplet}</p>
            <p className="text-xs text-slate-500">{role.replaceAll("_", " ")}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
}
