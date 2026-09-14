import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SignatureUploader } from "@/components/profil/SignatureUploader";
import { libelleRole } from "@/lib/format";
import { PenLine, User } from "lucide-react";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const utilisateur = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { nom: true, prenom: true, grade: true, email: true, role: true, signature: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Mon profil" description="Informations de compte et signature" />

      <Card>
        <CardHeader title="Identité" icon={<User className="h-4 w-4" />} />
        <CardBody className="space-y-1 text-sm">
          <p className="font-medium text-slate-900">{utilisateur?.grade} {utilisateur?.prenom} {utilisateur?.nom}</p>
          <p className="text-slate-500">{utilisateur?.email}</p>
          <p className="text-slate-500">{libelleRole(utilisateur?.role ?? "")}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Signature"
          icon={<PenLine className="h-4 w-4" />}
          description="Utilisée automatiquement lors de la génération des certificats et ordonnances"
        />
        <CardBody>
          <SignatureUploader aUneSignature={Boolean(utilisateur?.signature)} />
        </CardBody>
      </Card>
    </div>
  );
}
