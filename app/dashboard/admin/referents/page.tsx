import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutGererReferents } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import ReferentsClient from "./ReferentsClient";

export default async function ReferentsPage() {
  const session = await getServerSession(authOptions);
  if (!peutGererReferents(session!.user.role)) {
    redirect("/dashboard");
  }

  const [unitesPatients, medecins, referents] = await Promise.all([
    prisma.patient.findMany({ distinct: ["unite"], select: { unite: true }, orderBy: { unite: "asc" } }),
    prisma.user.findMany({
      where: {
        actif: true,
        role: { in: ["MEDECIN_CHEF", "MEDECIN_PRINCIPAL", "MEDECIN_ARMES", "INTERNE_MEDECINE", "EXTERNE_MEDECINE"] },
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      select: { id: true, nom: true, prenom: true, grade: true },
    }),
    prisma.uniteReferent.findMany({ select: { unite: true, medecinId: true } }),
  ]);

  const unites = Array.from(new Set(unitesPatients.map((p) => p.unite))).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <div>
      <PageHeader
        title="Médecins référents par unité"
        description="Oriente les signalements d'inaptitude infirmiers vers le bon interlocuteur (réservé au médecin-chef)."
      />
      <ReferentsClient
        unites={unites}
        medecins={medecins}
        referentsActuels={Object.fromEntries(referents.map((r) => [r.unite, r.medecinId]))}
      />
    </div>
  );
}
