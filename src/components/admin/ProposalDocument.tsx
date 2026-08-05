import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

export interface ProposalPhase {
  title: string;
  description: string;
  duration: string;
}

export interface ProposalData {
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType: string;
  summary: string;
  roiLossEstimate?: string;
  phases: ProposalPhase[];
  investment: string;
  paymentTerms: string;
  nfGuarantee?: string;
  validUntil: string;
}

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
  docInfo: {
    textAlign: "right",
  },
  agencyName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  agencyAccent: {
    color: "#22c55e",
  },
  agencyTagline: {
    fontSize: 8,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
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
    marginBottom: 15,
    flexDirection: "row",
  },
  clientField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    color: "#71717a",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  fieldValue: {
    fontSize: 10,
    color: "#09090b",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#09090b",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roiBox: {
    backgroundColor: "#fef2f2",
    borderLeft: "3px solid #ef4444",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  roiTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#991b1b",
    textTransform: "uppercase",
  },
  roiText: {
    fontSize: 9,
    color: "#7f1d1d",
    marginTop: 3,
  },
  summaryText: {
    fontSize: 9.5,
    color: "#3f3f46",
    lineHeight: 1.5,
    marginBottom: 15,
  },
  phaseCard: {
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
  },
  phaseDuration: {
    fontSize: 8,
    color: "#22c55e",
    fontFamily: "Helvetica-Bold",
  },
  phaseDesc: {
    fontSize: 8.5,
    color: "#52525b",
    lineHeight: 1.4,
  },
  investmentBox: {
    backgroundColor: "#f0fdf4",
    border: "1.5px solid #22c55e",
    borderRadius: 8,
    padding: 14,
    marginTop: 15,
  },
  invTitle: {
    fontSize: 8,
    color: "#15803d",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  invAmount: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    marginTop: 2,
    marginBottom: 6,
  },
  invTerms: {
    fontSize: 8.5,
    color: "#15803d",
    lineHeight: 1.4,
  },
  nfBadge: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #bbf7d0",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    borderTop: "1px solid #e4e4e7",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#a1a1aa",
  },
});

export const ProposalDocument: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Document title={`Proposta HLJ DEV - ${data.clientName}`}>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.agencyInfo}>
          <Text style={styles.agencyName}>
            HLJ <Text style={styles.agencyAccent}>DEV</Text>
          </Text>
          <Text style={styles.agencyTagline}>Software Engineering & IA de Elite</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>Proposta Comercial</Text>
          <Text style={styles.docDate}>Validade: {data.validUntil}</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.clientSection}>
        <View style={styles.clientField}>
          <Text style={styles.fieldLabel}>Cliente</Text>
          <Text style={styles.fieldValue}>{data.clientName}</Text>
        </View>
        <View style={styles.clientField}>
          <Text style={styles.fieldLabel}>Empresa / Projeto</Text>
          <Text style={styles.fieldValue}>{data.clientCompany}</Text>
        </View>
        <View style={styles.clientField}>
          <Text style={styles.fieldLabel}>Tipo de Solução</Text>
          <Text style={styles.fieldValue}>{data.serviceType.toUpperCase()}</Text>
        </View>
      </View>

      {/* ROI / Perda Estimada */}
      {data.roiLossEstimate && (
        <View style={styles.roiBox}>
          <Text style={styles.roiTitle}>⚠️ Diagnóstico Financeiro & Vácuo Digital</Text>
          <Text style={styles.roiText}>{data.roiLossEstimate}</Text>
        </View>
      )}

      {/* Summary */}
      <Text style={styles.sectionTitle}>1. Diagnóstico & Escopo Estratégico</Text>
      <Text style={styles.summaryText}>{data.summary}</Text>

      {/* Phases */}
      <Text style={styles.sectionTitle}>2. Cronograma de Execução</Text>
      {data.phases.map((phase, idx) => (
        <View key={idx} style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.phaseDuration}>{phase.duration}</Text>
          </View>
          <Text style={styles.phaseDesc}>{phase.description}</Text>
        </View>
      ))}

      {/* Investment & Payment Options */}
      <View style={styles.investmentBox}>
        <Text style={styles.invTitle}>3. Investimento & Opções de Parcelamento</Text>
        <Text style={styles.invAmount}>{data.investment}</Text>
        <Text style={styles.invTerms}>💳 Condições: {data.paymentTerms}</Text>

        {data.nfGuarantee && (
          <Text style={styles.nfBadge}>
            📜 {data.nfGuarantee} (Simples Nacional)
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>HLJ DEV Tecnologia LTDA • hljdev.com.br</Text>
        <Text>Página 1 de 1</Text>
        <Text>Documento gerado eletronicamente</Text>
      </View>
    </Page>
  </Document>
);
