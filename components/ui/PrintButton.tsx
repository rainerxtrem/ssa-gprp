"use client";

import { Printer } from "lucide-react";
import { bouton } from "@/lib/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={bouton("secondaire")}>
      <Printer className="h-4 w-4" />
      Imprimer
    </button>
  );
}
