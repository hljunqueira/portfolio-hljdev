import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
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
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontFamily: "Helvetica",
    padding: 0,
  },
  // Header stripe
  headerBar: {
    backgroundColor: "#22c55e",
    height: 8,
    width: "100%",
  },
  header: {
    backgroundColor: "#111111",
    padding: "32px 48px 24px",
    borderBottom: "1px solid #1f1f1f",
  },
  agencyLabel: {
    fontSize: 8,
    color: "#22c55e",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  agencyName: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: -1,
    lineHeight: 1.1,
  },
  agencyNameAccent: {
    color: "#22c55e",
  },
  agencyTagline: {
    fontSize: 9,
    color: "#52525b",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
  },
  headerRight: {
    position: "absolute",
    right: 48,
    top: 32,
    alignItems: "flex-end",
  },
  docLabel: {
    fontSize: 8,
    color: "#22c55e",
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  docDate: {
    fontSize: 8,
    color: "#52525b",
    marginTop: 4,
    fontFamily: "Helvetica",
  },
  // Body
  body: {
    padding: "32px 48px",
    flex: 1,
  },
  // Client Info Block
  clientBlock: {
    backgroundColor: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
    flexDirection: "row",
    gap: 32,
  },
  clientField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    color: "#52525b",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 11,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  fieldValueSmall: {
    fontSize: 9,
    color: "#a1a1aa",
    fontFamily: "Helvetica",
  },
  // Section
  sectionTitle: {
    fontSize: 8,
    color: "#22c55e",
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    marginTop: 20,
    borderBottom: "1px solid #1f1f1f",
    paddingBottom: 8,
  },
  // Scope body text
  proposalText: {
    fontSize: 10,
    color: "#a1a1aa",
    lineHeight: 1.7,
    fontFamily: "Helvetica",
  },
  // Phase cards
  phaseCard: {
    backgroundColor: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  phaseNumber: {
    backgroundColor: "#22c55e",
    color: "#000000",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  phaseNumberText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  phaseContent: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 10,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  phaseDesc: {
    fontSize: 9,
    color: "#71717a",
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  // Pricing block
  pricingBlock: {
    backgroundColor: "#0d1f15",
    border: "1px solid #1a3322",
    borderRadius: 12,
    padding: "20px 24px",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pricingLabel: {
    fontSize: 8,
    color: "#22c55e",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: -1,
  },
  pricingNote: {
    fontSize: 8,
    color: "#52525b",
    fontFamily: "Helvetica",
    marginTop: 4,
  },
  pricingBadge: {
    backgroundColor: "#22c55e",
    color: "#000000",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    padding: "6px 14px",
    borderRadius: 6,
  },
  // Footer
  footer: {
    backgroundColor: "#111111",
    borderTop: "1px solid #1f1f1f",
    padding: "16px 48px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#52525b",
    fontFamily: "Helvetica",
  },
  footerBrand: {
    fontSize: 8,
    color: "#22c55e",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
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
        {/* Green top bar */}
        <View style={styles.headerBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.agencyLabel}>Agência de Tecnologia & IA</Text>
          <Text style={styles.agencyName}>
            HLJ <Text style={styles.agencyNameAccent}>DEV</Text>
          </Text>
          <Text style={styles.agencyTagline}>Sistemas • Automação • Inteligência Artificial</Text>

          <View style={styles.headerRight}>
            <Text style={styles.docLabel}>Proposta Comercial</Text>
            <Text style={styles.docTitle}>{data.projectType}</Text>
            <Text style={styles.docDate}>Emitida em {today}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Client Info */}
          <View style={styles.clientBlock}>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Proposta para</Text>
              <Text style={styles.fieldValue}>{data.clientName}</Text>
            </View>
            {data.clientPhone && (
              <View style={styles.clientField}>
                <Text style={styles.fieldLabel}>Contato</Text>
                <Text style={styles.fieldValueSmall}>{data.clientPhone}</Text>
              </View>
            )}
            {data.clientEmail && (
              <View style={styles.clientField}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <Text style={styles.fieldValueSmall}>{data.clientEmail}</Text>
              </View>
            )}
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Válida até</Text>
              <Text style={styles.fieldValueSmall}>{data.validUntil}</Text>
            </View>
          </View>

          {/* Overview */}
          <Text style={styles.sectionTitle}>Visão Geral do Projeto</Text>
          <Text style={styles.proposalText}>{data.summary}</Text>

          {/* Phases */}
          <Text style={styles.sectionTitle}>Escopo e Cronograma de Fases</Text>
          {data.phases.map((phase, index) => (
            <View key={index} style={styles.phaseCard}>
              <View style={styles.phaseNumber}>
                <Text style={styles.phaseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.phaseContent}>
                <Text style={styles.phaseTitle}>
                  {phase.title} — {phase.duration}
                </Text>
                <Text style={styles.phaseDesc}>{phase.description}</Text>
              </View>
            </View>
          ))}

          {/* Pricing */}
          <View style={styles.pricingBlock}>
            <View>
              <Text style={styles.pricingLabel}>Investimento Total</Text>
              <Text style={styles.pricingValue}>{data.investment}</Text>
              <Text style={styles.pricingNote}>{data.paymentTerms}</Text>
            </View>
            <Text style={styles.pricingBadge}>Aprovado</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            hljdev.com.br • contato@hljdev.com.br
          </Text>
          <Text style={styles.footerBrand}>HLJ DEV — Sistemas & IA</Text>
          <Text style={styles.footerText}>
            Proposta confidencial e não transferível
          </Text>
        </View>
      </Page>
    </Document>
  );
}
