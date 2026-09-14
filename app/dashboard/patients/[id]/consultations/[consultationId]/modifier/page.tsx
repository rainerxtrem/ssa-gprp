import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { peutCreerConsultationSuiviInfirmier, peutEcrireDossierMedical } from "@/lib/auth-guards";
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
  const role = session!.user.role;

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation || consultation.patientId !== id) notFound();

  const peutEditer =
    peutEcrireDossierMedical(role) ||
    (peutCreerConsultationSuiviInfirmier(role) &&
      consultation.type === "SUIVI_INFIRMIER" &&
      consultation.medecinId === session!.user.id);
  if (!peutEditer) {
    redirect(`/dashboard/patients/${id}/consultations/${consultationId}`);
  }
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
        forcerSuiviInfirmier={consultation.type === "SUIVI_INFIRMIER" && !peutEcrireDossierMedical(role)}
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
