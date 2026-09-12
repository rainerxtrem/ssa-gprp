import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutEcrireDossierMedical } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import ConsultationForm from "../../nouveau/ConsultationForm";

function versChamp(valeur: number | null): string {
  return valeur === null || valeur === undefined ? "" : String(valeur);
}

export default async function ModifierConsultationPage({
  params,
}: {
  params: Promise<{ id: string; consultationId: string }>;
}) {
  const { id, consultationId } = await params;
  const session = await getServerSession(authOptions);
  if (!peutEcrireDossierMedical(session!.user.role)) {
    redirect(`/dashboard/patients/${id}/consultations/${consultationId}`);
  }

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation || consultation.patientId !== id) notFound();
  if (consultation.annuleLe) {
    redirect(`/dashboard/patients/${id}/consultations/${consultationId}`);
  }

  return (
    <div>
      <PageHeader
        title="Modifier la consultation"
        backHref={`/dashboard/patients/${id}/consultations/${consultationId}`}
        backLabel="Retour au détail"
      />
      <ConsultationForm
        patientId={id}
        mode="modifier"
        consultationId={consultation.id}
        valeursInitiales={{
          motif: consultation.motif,
          anamnese: consultation.anamnese ?? "",
          examenClinique: consultation.examenClinique ?? "",
          temperature: versChamp(consultation.temperature),
          tensionSystolique: versChamp(consultation.tensionSystolique),
          tensionDiastolique: versChamp(consultation.tensionDiastolique),
          frequenceCardiaque: versChamp(consultation.frequenceCardiaque),
          saturationO2: versChamp(consultation.saturationO2),
          poids: versChamp(consultation.poids),
          taille: versChamp(consultation.taille),
          diagnostic: consultation.diagnostic ?? "",
          conduiteATenir: consultation.conduiteATenir ?? "",
        }}
      />
    </div>
  );
}
