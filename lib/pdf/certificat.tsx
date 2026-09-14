/** @jsxRuntime classic */
/** @jsx React.createElement */

// Next's App Router bundles every file under app/ (route handlers included)
// through webpack with the "react-server" condition, which resolves `react`
// to a restricted build. @react-pdf/renderer's reconciler expects elements
// built with the plain client `react`. Loading both `react` and
// `@react-pdf/renderer` via a real Node require (opaque to webpack thanks to
// the eval indirection) sidesteps that condition entirely, so the elements
// this file creates are recognized by react-pdf's renderer instead of
// crashing with a minified React error #31.
import {
  APTITUDE_STATUS_LABELS,
  CONCLUSION_ENGAGEMENT_LABELS,
  CONCLUSION_SUIVI_LABELS,
  SIGYCOP_MENTION_LEGALE,
} from "@/lib/sigycop";
import { genererQrCodePng } from "@/lib/pdf/qrcode";

const nodeRequire = eval("require") as NodeRequire;
const React = nodeRequire("react");
const { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } = nodeRequire("@react-pdf/renderer");

type AptitudeStatus = "APTE" | "APTE_RESTRICTION" | "INAPTE" | "NON_EVALUE";

export interface CertificatPdfData {
  type: "ENGAGEMENT" | "SUIVI";
  nom: string;
  prenom: string;
  ddn: Date;
  rio: string;
  grade: string;
  specialite?: string | null;

  s: number;
  i: number;
  g: number;
  y: number;
  c: number;
  o: number;
  p: number;

  aptitudeGeneraleSPP: AptitudeStatus;
  aptitudeInitialeGES: AptitudeStatus;
  aptitudeMIR: AptitudeStatus;
  aptitudeGRIMP: AptitudeStatus;
  aptitudeNRBCe: AptitudeStatus;
  aptitudeGHSC: AptitudeStatus;
  conduiteGroupeLeger: AptitudeStatus;
  conduiteGroupeLourd: AptitudeStatus;
  opex: AptitudeStatus;
  contreIndicationEPMS: boolean;

  observations?: string | null;
  conclusion: string;
  lieu: string;
  dateCertificat: Date;
  medecinNomComplet: string;
  medecinGrade: string;
  /** PNG à fond transparent de la signature du médecin, si déposée dans son profil. */
  medecinSignaturePng?: Buffer | null;
  /** URL de la page du certificat dans l'application, encodée en QR code de vérification. */
  urlVerification?: string | null;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { textAlign: "center", borderBottom: 2, borderColor: "#0f172a", paddingBottom: 8, marginBottom: 12 },
  eyebrow: { fontSize: 9, textTransform: "uppercase", fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 14, textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginTop: 4 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 4 },
  box: { border: 1, borderColor: "#334155", padding: 6 },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  label: { fontFamily: "Helvetica-Bold" },
  sigycopTable: { flexDirection: "row", border: 1, borderColor: "#0f172a" },
  sigycopCell: {
    flex: 1,
    borderRight: 1,
    borderColor: "#0f172a",
    textAlign: "center",
    paddingVertical: 4,
  },
  sigycopHeaderCell: { backgroundColor: "#e2e8f0", fontFamily: "Helvetica-Bold" },
  legalMention: { fontSize: 8, fontStyle: "italic", marginTop: 3 },
  table: { border: 1, borderColor: "#0f172a" },
  tableRow: { flexDirection: "row", borderBottom: 1, borderColor: "#0f172a" },
  tableCellLabel: { flex: 3, padding: 4, borderRight: 1, borderColor: "#0f172a" },
  tableCellValue: { flex: 1, padding: 4, textAlign: "center" },
  conclusionRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  bullet: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: "#0f172a", marginRight: 6 },
  bulletChecked: { backgroundColor: "#0f172a" },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  signatureLine: { marginTop: 40, borderBottom: 1, borderColor: "#0f172a", width: 180 },
  signatureZone: { marginTop: 8, height: 60, width: 180, alignItems: "flex-end" },
  signatureImage: { maxHeight: 60, maxWidth: 180, objectFit: "contain" },
  qrZone: { position: "absolute", bottom: 16, right: 36, alignItems: "center" },
  qrImage: { width: 46, height: 46 },
  qrLabel: { fontSize: 6, color: "#64748b", marginTop: 2 },
});

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const LIGNES_APTITUDES: { cle: keyof CertificatPdfData; label: string }[] = [
  { cle: "aptitudeGeneraleSPP", label: "Aptitude générale au service — SAPEURS-POMPIERS DE PARIS" },
  { cle: "aptitudeInitialeGES", label: "Aptitude initiale GES" },
  { cle: "aptitudeMIR", label: "Spécialité MIR" },
  { cle: "aptitudeGRIMP", label: "Spécialité GRIMP" },
  { cle: "aptitudeNRBCe", label: "Spécialité NRBCe" },
  { cle: "aptitudeGHSC", label: "Spécialité GHSC" },
  { cle: "conduiteGroupeLeger", label: "Conduite de véhicules du groupe léger" },
  { cle: "conduiteGroupeLourd", label: "Conduite de véhicules du groupe lourd" },
  { cle: "opex", label: "Opérations Extérieures (OPEX)" },
];

function libelleConclusion(data: CertificatPdfData): string {
  if (data.type === "ENGAGEMENT") {
    return (
      CONCLUSION_ENGAGEMENT_LABELS[data.conclusion as keyof typeof CONCLUSION_ENGAGEMENT_LABELS] ??
      data.conclusion
    );
  }
  return CONCLUSION_SUIVI_LABELS[data.conclusion as keyof typeof CONCLUSION_SUIVI_LABELS] ?? data.conclusion;
}

function conclusionsPossibles(type: "ENGAGEMENT" | "SUIVI"): { valeur: string; label: string }[] {
  const labels = type === "ENGAGEMENT" ? CONCLUSION_ENGAGEMENT_LABELS : CONCLUSION_SUIVI_LABELS;
  return Object.entries(labels).map(([valeur, label]) => ({ valeur, label: label as string }));
}

function CertificatDocument({ data, qrCodePng }: { data: CertificatPdfData; qrCodePng?: Buffer | null }) {
  const titre =
    data.type === "ENGAGEMENT" ? "Certificat médical d'engagement" : "Certificat de suivi des aptitudes";

  return (
    <Document
      title={`${titre} - ${data.nom} ${data.prenom}`}
      author="Service de Santé des Armées"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Service de Santé des Armées</Text>
          <Text style={styles.title}>{titre}</Text>
        </View>

        <View style={[styles.section, styles.box]}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text><Text style={styles.label}>Nom : </Text>{data.nom}</Text>
              <Text><Text style={styles.label}>Prénom : </Text>{data.prenom}</Text>
              <Text><Text style={styles.label}>Date de naissance : </Text>{formatDateFr(data.ddn)}</Text>
            </View>
            <View style={styles.col}>
              <Text><Text style={styles.label}>Identifiant défense (RIO) : </Text>{data.rio}</Text>
              <Text><Text style={styles.label}>Grade : </Text>{data.grade}</Text>
              <Text><Text style={styles.label}>Spécialité : </Text>{data.specialite || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grille SIGYCOP</Text>
          <View style={styles.sigycopTable}>
            {(["s", "i", "g", "y", "c", "o", "p"] as const).map((lettre) => (
              <View key={`h-${lettre}`} style={[styles.sigycopCell, styles.sigycopHeaderCell]}>
                <Text>{lettre.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <View style={styles.sigycopTable}>
            {(["s", "i", "g", "y", "c", "o", "p"] as const).map((lettre) => (
              <View key={`v-${lettre}`} style={styles.sigycopCell}>
                <Text>{data[lettre]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.legalMention}>{SIGYCOP_MENTION_LEGALE}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aptitudes</Text>
          <View style={styles.table}>
            {LIGNES_APTITUDES.map(({ cle, label }) => (
              <View key={cle} style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>{label}</Text>
                <Text style={styles.tableCellValue}>
                  {APTITUDE_STATUS_LABELS[data[cle] as AptitudeStatus]}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { borderBottom: 0 }]}>
              <Text style={styles.tableCellLabel}>
                Contre-indication : pratique des épreuves de l'entraînement physique militaire
                et sportif (EPMS)
              </Text>
              <Text style={styles.tableCellValue}>{data.contreIndicationEPMS ? "Oui" : "Non"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observations ou restrictions éventuelles</Text>
          <View style={styles.box}>
            <Text>{data.observations || "Néant"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conclusion</Text>
          <View style={styles.box}>
            {conclusionsPossibles(data.type).map(({ valeur, label }) => (
              <View key={valeur} style={styles.conclusionRow}>
                <View style={[styles.bullet, valeur === data.conclusion ? styles.bulletChecked : {}]} />
                <Text>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text><Text style={styles.label}>Fait à : </Text>{data.lieu}</Text>
            <Text><Text style={styles.label}>Le : </Text>{formatDateFr(data.dateCertificat)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Signature et cachet du médecin</Text>
            <Text>{data.medecinGrade} {data.medecinNomComplet}</Text>
            {data.medecinSignaturePng ? (
              <View style={styles.signatureZone}>
                <Image style={styles.signatureImage} src={{ data: data.medecinSignaturePng, format: "png" }} />
              </View>
            ) : (
              <View style={styles.signatureLine} />
            )}
          </View>
        </View>

        <Text style={{ position: "absolute", bottom: 20, left: 36, maxWidth: 420, fontSize: 7, color: "#64748b" }}>
          Conclusion retenue : {libelleConclusion(data)} — Document généré automatiquement, à conserver
          dans le dossier médical du patient.
        </Text>

        {qrCodePng && (
          <View style={styles.qrZone}>
            <Image style={styles.qrImage} src={{ data: qrCodePng, format: "png" }} />
            <Text style={styles.qrLabel}>Vérifier ce document</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

/** Génère le PDF du certificat et retourne son contenu binaire, prêt à être stocké en base. */
export async function genererCertificatPdf(data: CertificatPdfData): Promise<Buffer> {
  const qrCodePng = data.urlVerification ? await genererQrCodePng(data.urlVerification) : null;
  return renderToBuffer(<CertificatDocument data={data} qrCodePng={qrCodePng} />);
}
