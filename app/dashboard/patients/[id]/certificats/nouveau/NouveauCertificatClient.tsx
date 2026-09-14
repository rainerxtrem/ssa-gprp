"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CertificatAptitudeForm, {
  type CertificatAptitudeData,
  type CertificatType,
} from "@/components/certificats/CertificatAptitudeForm";

export default function NouveauCertificatClient({
  type,
  patientId,
  donneesInitiales,
  mode = "creer",
  certificatId,
  signalementId,
}: {
  type: CertificatType;
  patientId: string;
  donneesInitiales: CertificatAptitudeData;
  mode?: "creer" | "modifier";
  certificatId?: string;
  signalementId?: string;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(data: CertificatAptitudeData) {
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

    const corps = {
      type,
      ...(mode === "creer" ? { patientId } : {}),
      ...(mode === "creer" && signalementId ? { signalementId } : {}),
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
    };

    const url = mode === "creer" ? "/api/certificats" : `/api/certificats/${certificatId}`;
    const method = mode === "creer" ? "POST" : "PATCH";

    const reponse = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const body = await reponse.json().catch(() => ({}));
      setErreur(body.error ?? "Erreur lors de l'enregistrement du certificat.");
      return;
    }

    if (mode === "creer") {
      router.push(`/dashboard/patients/${patientId}?onglet=aptitudes`);
    } else {
      router.push(`/dashboard/patients/${patientId}/certificats/${certificatId}?type=${type}`);
    }
    router.refresh();
  }

  return (
    <div>
      {erreur && (
        <p className="mx-auto mb-4 max-w-3xl rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 print:hidden">
          {erreur}
        </p>
      )}
      {enCours && (
        <p className="mx-auto mb-4 max-w-3xl text-sm text-slate-500 print:hidden">Enregistrement en cours...</p>
      )}
      <CertificatAptitudeForm type={type} data={donneesInitiales} editable onSubmit={onSubmit} />
    </div>
  );
}
