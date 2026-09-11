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
const nodeRequire = eval("require") as NodeRequire;
const React = nodeRequire("react");
const { Document, Page, Text, View, StyleSheet, renderToBuffer } = nodeRequire("@react-pdf/renderer");

export interface LigneMedicament {
  nom: string;
  dosage?: string;
  forme?: string;
  posologie: string;
  duree: string;
}

export interface OrdonnancePdfData {
  patientNom: string;
  patientPrenom: string;
  patientDdn: Date;
  patientRio: string;
  medicaments: LigneMedicament[];
  instructions?: string | null;
  datePrescription: Date;
  medecinNomComplet: string;
  medecinGrade: string;
  lieu: string;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { textAlign: "center", borderBottom: 2, borderColor: "#0f172a", paddingBottom: 8, marginBottom: 16 },
  eyebrow: { fontSize: 9, textTransform: "uppercase", fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 14, textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginTop: 4 },
  patientBox: { border: 1, borderColor: "#334155", padding: 8, marginBottom: 20 },
  label: { fontFamily: "Helvetica-Bold" },
  medicamentBlock: { marginBottom: 14 },
  medicamentNom: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  medicamentDetail: { marginTop: 2, marginLeft: 10 },
  instructionsBox: { border: 1, borderColor: "#334155", padding: 8, marginTop: 10 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureLine: { marginTop: 40, borderBottom: 1, borderColor: "#0f172a", width: 180 },
});

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function OrdonnanceDocument({ data }: { data: OrdonnancePdfData }) {
  return (
    <Document title={`Ordonnance - ${data.patientNom} ${data.patientPrenom}`} author="Service de Santé des Armées">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Service de Santé des Armées</Text>
          <Text style={styles.title}>Ordonnance médicale</Text>
        </View>

        <View style={styles.patientBox}>
          <Text><Text style={styles.label}>Patient : </Text>{data.patientNom} {data.patientPrenom}</Text>
          <Text><Text style={styles.label}>Date de naissance : </Text>{formatDateFr(data.patientDdn)}</Text>
          <Text><Text style={styles.label}>Identifiant défense (RIO) : </Text>{data.patientRio}</Text>
        </View>

        {data.medicaments.map((m, idx) => (
          <View key={idx} style={styles.medicamentBlock}>
            <Text style={styles.medicamentNom}>
              {idx + 1}. {m.nom}{m.dosage ? ` — ${m.dosage}` : ""}{m.forme ? ` (${m.forme})` : ""}
            </Text>
            <Text style={styles.medicamentDetail}>Posologie : {m.posologie}</Text>
            <Text style={styles.medicamentDetail}>Durée : {m.duree}</Text>
          </View>
        ))}

        {data.instructions && (
          <View style={styles.instructionsBox}>
            <Text style={styles.label}>Instructions complémentaires</Text>
            <Text style={{ marginTop: 4 }}>{data.instructions}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <View>
            <Text><Text style={styles.label}>Fait à : </Text>{data.lieu}</Text>
            <Text><Text style={styles.label}>Le : </Text>{formatDateFr(data.datePrescription)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Signature et cachet du médecin</Text>
            <Text>{data.medecinGrade} {data.medecinNomComplet}</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        <Text style={{ position: "absolute", bottom: 20, left: 40, fontSize: 7, color: "#64748b" }}>
          Document généré automatiquement, à conserver dans le dossier médical du patient.
        </Text>
      </Page>
    </Document>
  );
}

export async function genererOrdonnancePdf(data: OrdonnancePdfData): Promise<Buffer> {
  return renderToBuffer(<OrdonnanceDocument data={data} />);
}
