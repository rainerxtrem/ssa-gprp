/** @jsxRuntime classic */
/** @jsx React.createElement */

// Voir lib/pdf/certificat.tsx pour l'explication du chargement natif :
// nécessaire pour éviter le conflit d'instances React sous l'App Router.
const nodeRequire = eval("require") as NodeRequire;
const React = nodeRequire("react");
const { Document, Page, Text, View, StyleSheet, renderToBuffer } = nodeRequire("@react-pdf/renderer");

import { APTITUDE_STATUS_LABELS, CONCLUSION_ENGAGEMENT_LABELS, CONCLUSION_SUIVI_LABELS } from "@/lib/sigycop";
import { TYPE_EXEMPTION_LABELS } from "@/lib/arrets";
import { STATUT_CONVOCATION_LABELS } from "@/lib/convocations";

export interface DossierPdfData {
  patient: {
    nom: string;
    prenom: string;
    ddn: Date;
    rio: string;
    grade: string;
    specialite?: string | null;
    unite: string;
  };
  profilsSigycop: { dateEvaluation: Date; s: number; i: number; g: number; y: number; c: number; o: number; p: number }[];
  certificatsSuivi: { dateCertificat: Date; conclusion: string; lieu: string; annuleLe: Date | null; medecin: string }[];
  certificatsEngagement: { dateCertificat: Date; conclusion: string; lieu: string; annuleLe: Date | null; medecin: string }[];
  consultations: { dateConsultation: Date; motif: string; diagnostic: string | null; annuleLe: Date | null; medecin: string }[];
  prescriptions: { datePrescription: Date; medicaments: string; annuleLe: Date | null; medecin: string }[];
  arrets: { dateDebut: Date; dateFin: Date; typeExemption: string; transmisCommandement: boolean }[];
  convocations: { dateConvocation: Date; statut: string; medecin: string }[];
  genereLe: Date;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  header: { textAlign: "center", borderBottom: 2, borderColor: "#0f172a", paddingBottom: 8, marginBottom: 12 },
  eyebrow: { fontSize: 8, textTransform: "uppercase", fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 13, textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginTop: 4 },
  patientBox: { border: 1, borderColor: "#334155", padding: 8, marginBottom: 14 },
  label: { fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 4,
    borderBottom: 1,
    borderColor: "#cbd5e1",
    paddingBottom: 2,
  },
  table: { border: 1, borderColor: "#94a3b8" },
  headerRow: { flexDirection: "row", backgroundColor: "#e2e8f0" },
  row: { flexDirection: "row", borderTop: 1, borderColor: "#cbd5e1" },
  cell: { flex: 1, padding: 3, borderRight: 1, borderColor: "#cbd5e1" },
  cellLast: { flex: 1, padding: 3 },
  cellHeader: { flex: 1, padding: 3, fontFamily: "Helvetica-Bold", borderRight: 1, borderColor: "#cbd5e1" },
  empty: { fontStyle: "italic", color: "#64748b", padding: 4 },
  annule: { color: "#b91c1c", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 16, left: 32, right: 32, fontSize: 7, color: "#64748b", textAlign: "center" },
});

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Tableau({ colonnes, lignes }: { colonnes: string[]; lignes: (React.ReactNode[] | null)[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {colonnes.map((c, i) => (
          <Text key={i} style={i === colonnes.length - 1 ? styles.cellLast : styles.cellHeader}>
            {c}
          </Text>
        ))}
      </View>
      {lignes.length === 0 ? (
        <Text style={styles.empty}>Aucun</Text>
      ) : (
        lignes.map((ligne, idx) => (
          <View key={idx} style={styles.row}>
            {ligne!.map((valeur, i) => (
              <Text key={i} style={i === ligne!.length - 1 ? styles.cellLast : styles.cell}>
                {valeur}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

function DossierDocument({ data }: { data: DossierPdfData }) {
  return (
    <Document title={`Dossier médical - ${data.patient.nom} ${data.patient.prenom}`} author="Service de Santé des Armées">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Service de Santé des Armées</Text>
          <Text style={styles.title}>Export du dossier médical complet</Text>
        </View>

        <View style={styles.patientBox}>
          <Text><Text style={styles.label}>Nom : </Text>{data.patient.nom} {data.patient.prenom}</Text>
          <Text><Text style={styles.label}>Date de naissance : </Text>{formatDateFr(data.patient.ddn)}</Text>
          <Text><Text style={styles.label}>RIO : </Text>{data.patient.rio}</Text>
          <Text><Text style={styles.label}>Grade / Unité : </Text>{data.patient.grade} — {data.patient.unite}</Text>
          {data.patient.specialite && <Text><Text style={styles.label}>Spécialité : </Text>{data.patient.specialite}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique SIGYCOP</Text>
          <Tableau
            colonnes={["Date", "S", "I", "G", "Y", "C", "O", "P"]}
            lignes={data.profilsSigycop.map((p) => [
              formatDateFr(p.dateEvaluation), String(p.s), String(p.i), String(p.g), String(p.y), String(p.c), String(p.o), String(p.p),
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificats de suivi des aptitudes</Text>
          <Tableau
            colonnes={["Date", "Conclusion", "Lieu", "Médecin"]}
            lignes={data.certificatsSuivi.map((c) => [
              formatDateFr(c.dateCertificat),
              (CONCLUSION_SUIVI_LABELS as Record<string, string>)[c.conclusion] ?? c.conclusion,
              c.lieu,
              c.annuleLe ? `${c.medecin} (annulé)` : c.medecin,
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificats d'engagement</Text>
          <Tableau
            colonnes={["Date", "Conclusion", "Lieu", "Médecin"]}
            lignes={data.certificatsEngagement.map((c) => [
              formatDateFr(c.dateCertificat),
              (CONCLUSION_ENGAGEMENT_LABELS as Record<string, string>)[c.conclusion] ?? c.conclusion,
              c.lieu,
              c.annuleLe ? `${c.medecin} (annulé)` : c.medecin,
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultations</Text>
          <Tableau
            colonnes={["Date", "Motif", "Diagnostic", "Médecin"]}
            lignes={data.consultations.map((c) => [
              formatDateFr(c.dateConsultation),
              c.motif,
              c.diagnostic || "—",
              c.annuleLe ? `${c.medecin} (annulée)` : c.medecin,
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordonnances</Text>
          <Tableau
            colonnes={["Date", "Médicaments", "Médecin"]}
            lignes={data.prescriptions.map((p) => [
              formatDateFr(p.datePrescription),
              p.medicaments,
              p.annuleLe ? `${p.medecin} (annulée)` : p.medecin,
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrêts de travail / exemptions</Text>
          <Tableau
            colonnes={["Type", "Début", "Fin", "Transmis commandement"]}
            lignes={data.arrets.map((a) => [
              TYPE_EXEMPTION_LABELS[a.typeExemption] ?? a.typeExemption,
              formatDateFr(a.dateDebut),
              formatDateFr(a.dateFin),
              a.transmisCommandement ? "Oui" : "Non",
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Convocations</Text>
          <Tableau
            colonnes={["Date", "Statut", "Médecin"]}
            lignes={data.convocations.map((c) => [
              formatDateFr(c.dateConvocation),
              STATUT_CONVOCATION_LABELS[c.statut] ?? c.statut,
              c.medecin,
            ])}
          />
        </View>

        <Text style={styles.footer}>
          Export généré le {formatDateFr(data.genereLe)} — document à usage médical interne, à protéger au titre du secret médical.
        </Text>
      </Page>
    </Document>
  );
}

export async function genererDossierPdf(data: DossierPdfData): Promise<Buffer> {
  return renderToBuffer(<DossierDocument data={data} />);
}
