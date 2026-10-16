export type Severity = "CRITICAL" | "MODERATE" | "LOW";

export interface LineItemQuote {
  item: string;
  costCAD: number;
}

export interface InspectionResult {
  zone: string;
  severity: Severity;
  memoryDelta: string;
  technicalDiagnosis: string;
  ontarioCodeReference: string;
  eonConfidenceScore: number;
  lineItemQuote: LineItemQuote[];
  totalEstimatedCostCAD: number;
  recommendedContractorAction: string;
  timestamp?: string;
  modelUsed?: string;
  fallbackTriggered?: boolean;
  latencyMs?: number;
  inspectorNotes?: string;
  imageUrl?: string;
}

export interface MemoryNode {
  id: string;
  buildingId: string;
  floor: string;
  zone: string;
  timestamp: string;
  severity: Severity;
  crackWidthInches: number;
  moisturePercentage: number;
  costCAD: number;
  headline: string;
  detail: string;
  codeReference: string;
  imageUrl?: string;
}

export interface SpatialHierarchy {
  building: string;
  address: string;
  floors: {
    id: string;
    name: string;
    zones: {
      id: string;
      name: string;
      currentRisk: Severity;
      nodes: MemoryNode[];
    }[];
  }[];
}

export type UserRole = "Lead Structural Inspector" | "General Contractor" | "Client Read-Only View";
