import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ShieldCheck, Stethoscope } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { peutHomologuerSignalement } from "@/lib/auth-guards";
import { listerSignalementsEnAttente } from "@/lib/patients";
import { APTITUDE_STATUS_LABELS } from "@/lib/sigycop";
import { formatDateHeureFr } from "@/lib/format";
import { bouton } from "@/lib/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { RecordCard } from "@/components/ui/RecordCard";
import { RejeterSignalementAction } from "@/components/signalements/RejeterSignalementAction";

export default async function SignalementsPage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  if (!peutHomologuerSignalement(role)) redirect("/dashboard");

  const signalements = await listerSignalementsEnAttente();

  return (
    <div>
      <PageHeader
        title="Signalements d'inaptitude en attente"
        description="Suivis infirmiers ayant conduit à une suspicion d'inaptitude — à homologuer ou rejeter."
      />

      {signalements.length === 0 ? (
        <EmptyState
          title="Aucun signalement en attente"
          description="Les suspicions d'inaptitude déclarées par les paramédicaux pendant un suivi apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <RecordCard
                  title={`${s.patient.grade} ${s.patient.nom} ${s.patient.prenom} — ${s.motif}`}
                  lines={[
                    `${s.patient.unite} · déclaré par ${s.infirmier.grade} ${s.infirmier.prenom} ${s.infirmier.nom} le ${formatDateHeureFr(s.createdAt)}`,
                    s.observations,
                    `Recommandation indicative : ${APTITUDE_STATUS_LABELS[s.recommandation]}`,
                  ]}
                  badges={
                    <>
                      {s.referent && (
                        <Badge couleur={s.referent.id === session!.user.id ? "emerald" : "slate"}>
                          <ShieldCheck className="mr-1 inline h-3 w-3" />
                          {s.referent.id === session!.user.id
                            ? "Vous êtes référent de cette unité"
                            : `Référent : ${s.referent.grade} ${s.referent.prenom} ${s.referent.nom}`}
                        </Badge>
                      )}
                    </>
                  }
                  action={
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/patients/${s.patient.id}/certificats/nouveau?type=SUIVI&signalementId=${s.id}`}
                        className={bouton("primaire", "sm")}
                      >
                        <Stethoscope className="h-4 w-4" />
                        Homologuer
                      </Link>
                      <RejeterSignalementAction signalementId={s.id} />
                    </div>
                  }
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
