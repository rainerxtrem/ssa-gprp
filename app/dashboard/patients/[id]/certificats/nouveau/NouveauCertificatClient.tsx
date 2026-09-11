"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CertificatSuiviAptitudes, {
  type CertificatSuiviAptitudesData,
} from "@/components/CertificatSuiviAptitudes";

export default function NouveauCertificatClient({
  patientId,
  donneesInitiales,
}: {
  patientId: string;
  donneesInitiales: CertificatSuiviAptitudesData;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(data: CertificatSuiviAptitudesData) {
    if (!data.conclusion) {
      setErreur("Merci de sélectionner une conclusion.");
      return;
    }
    if (!data.lieu) {
      setErreur("Le lieu de signature est requis.");
      return;
    }

    setErreur(null);
    setEnCours(true);

    const reponse = await fetch("/api/certificats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "SUIVI",
        patientId,
        sigycop: { s: data.s, i: data.i, g: data.g, y: data.y, c: data.c, o: data.o, p: data.p },
        aptitudes: {
          aptitudeGeneraleSPP: data.aptitudeGeneraleSPP,
          aptitudeInitialeGES: data.aptitudeInitialeGES,
          aptitudeMIR: data.aptitudeMIR,
          aptitudeGRIMP: data.aptitudeGRIMP,
          aptitudeNRBCe: data.aptitudeNRBCe,
          aptitudeGHSC: data.aptitudeGHSC,
          conduiteGroupeLeger: data.conduiteGroupeLeger,
          conduiteGroupeLourd: data.conduiteGroupeLourd,
          opex: data.opex,
          contreIndicationEPMS: data.contreIndicationEPMS,
        },
        observations: data.observations || undefined,
        lieu: data.lieu,
        conclusion: data.conclusion,
        dateCertificat: data.dateCertificat,
      }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const body = await reponse.json().catch(() => ({}));
      setErreur(body.error ?? "Erreur lors de l'enregistrement du certificat.");
      return;
    }

    router.push(`/dashboard/patients/${patientId}`);
    router.refresh();
  }

  return (
    <div>
      {erreur && (
        <p className="mx-auto mb-4 max-w-3xl rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 print:hidden">
          {erreur}
        </p>
      )}
      {enCours && (
        <p className="mx-auto mb-4 max-w-3xl text-sm text-slate-500 print:hidden">Enregistrement en cours...</p>
      )}
      <CertificatSuiviAptitudes data={donneesInitiales} editable onSubmit={onSubmit} />
    </div>
  );
}
