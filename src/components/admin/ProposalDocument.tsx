import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register a clean font (system fallback)
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff" },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#18181b",
    fontFamily: "Helvetica",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "2px solid #22c55e",
    paddingBottom: 15,
  },
  agencyInfo: {
    flexDirection: "column",
  },
  agencyName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  agencyNameAccent: {
    color: "#22c55e",
  },
  agencyTagline: {
    fontSize: 8,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  docInfo: {
    textAlign: "right",
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#22c55e",
  },
  docDate: {
    fontSize: 8,
    color: "#a1a1aa",
    marginTop: 2,
  },
  clientSection: {
    backgroundColor: "#f4f4f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 20,
  },
  clientField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    color: "#71717a",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000000",
    marginBottom: 8,
    borderLeft: "3px solid #22c55e",
    paddingLeft: 8,
  },
  summaryText: {
    fontSize: 9,
    color: "#3f3f46",
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "justify",
  },
  mockupSection: {
    marginVertical: 15,
    alignItems: "center",
  },
  mockupImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid #e4e4e7",
  },
  mockupLabel: {
    fontSize: 7,
    color: "#22c55e",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 6,
  },
  phasesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  phaseCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    border: "1px solid #e4e4e7",
    padding: 10,
    borderRadius: 6,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
  },
  phaseDuration: {
    fontSize: 8,
    color: "#22c55e",
    fontFamily: "Helvetica-Bold",
  },
  phaseDesc: {
    fontSize: 8,
    color: "#71717a",
    lineHeight: 1.4,
  },
  pricingFooter: {
    marginTop: "auto",
    paddingTop: 15,
    borderTop: "1px solid #e4e4e7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  investmentBox: {
    backgroundColor: "#f0fdf4",
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #dcfce7",
  },
  investmentLabel: {
    fontSize: 8,
    color: "#166534",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  investmentValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#14532d",
  },
  paymentTerms: {
    fontSize: 8,
    color: "#166534",
    marginTop: 2,
  },
  footerBrand: {
    textAlign: "right",
  },
  footerWeb: {
    fontSize: 8,
    color: "#71717a",
  },
  footerContact: {
    fontSize: 8,
    color: "#22c55e",
    fontFamily: "Helvetica-Bold",
  },
});

export interface ProposalData {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  projectType: string;
  summary: string;
  phases: { title: string; description: string; duration: string }[];
  investment: string;
  paymentTerms: string;
  validUntil: string;
  mockupUrl?: string;
}

export function ProposalDocument({ data }: { data: ProposalData }) {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Proposta HLJ DEV - ${data.clientName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.agencyInfo}>
            <Text style={styles.agencyName}>
              HLJ <Text style={styles.agencyNameAccent}>DEV</Text>
            </Text>
            <Text style={styles.agencyTagline}>Sistemas • Automação • IA</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>{data.projectType}</Text>
            <Text style={styles.docDate}>Emitida em {today}</Text>
          </View>
        </View>

        <View style={styles.clientSection}>
          <View style={styles.clientField}>
            <Text style={styles.fieldLabel}>Cliente</Text>
            <Text style={styles.fieldValue}>{data.clientName}</Text>
          </View>
          <View style={styles.clientField}>
            <Text style={styles.fieldLabel}>E-mail / Telefone</Text>
            <Text style={styles.fieldValue}>{data.clientEmail || data.clientPhone || "Direto"}</Text>
          </View>
          <View style={styles.clientField}>
            <Text style={styles.fieldLabel}>Validade</Text>
            <Text style={styles.fieldValue}>{data.validUntil}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Escopo Estratégico</Text>
        <Text style={styles.summaryText}>{data.summary}</Text>

        {data.mockupUrl && (
          <View style={styles.mockupSection} wrap={false}>
            <Text style={styles.sectionTitle}>Conceito Inicial & Design Proposto</Text>
            <Image src={data.mockupUrl} style={styles.mockupImage} />
            <Text style={styles.mockupLabel}>— Protótipo Visual Sugerido para {data.clientName} —</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Cronograma de Fases</Text>
        <View style={styles.phasesGrid}>
          {data.phases.map((phase, i) => (
            <View key={i} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseDuration}>{phase.duration}</Text>
              </View>
              <Text style={styles.phaseDesc}>{phase.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pricingFooter}>
          <View style={styles.investmentBox}>
            <Text style={styles.investmentLabel}>Investimento Estimado</Text>
            <Text style={styles.investmentValue}>{data.investment}</Text>
            <Text style={styles.paymentTerms}>{data.paymentTerms}</Text>
          </View>
          <View style={styles.footerBrand}>
            <Text style={styles.footerWeb}>hljdev.com.br</Text>
            <Text style={styles.footerContact}>contato@hljdev.com.br</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
